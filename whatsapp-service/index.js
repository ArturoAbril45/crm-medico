require('dotenv').config();

const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const axios = require('axios');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadMediaMessage,
} = require('@whiskeysockets/baileys');
const { sendList: sendListaInteractiva, getButtonReplyId, getListReplyId } = require('./baileys-buttons.cjs');

const PORT = process.env.PORT || 3300;
const LARAVEL_WEBHOOK_URL = process.env.LARAVEL_WEBHOOK_URL || 'http://localhost:8000/api/whatsapp/webhook';
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || '';
const AUTH_ROOT = path.join(__dirname, 'auth_session');
const MEDIA_DIR = path.join(__dirname, 'media_recibida');
if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });

const logger = pino({ level: 'warn' });

function conTimeout(promesa, ms, etiqueta) {
  return Promise.race([
    promesa,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`timeout de ${ms}ms en ${etiqueta}`)), ms)),
  ]);
}

// Una sesion de WhatsApp por compania, cada una con su propio socket, estado
// y carpeta de credenciales (auth_session/<companiaId>/) — completamente
// independientes entre si. `sesiones` vive solo en memoria del proceso.
const sesiones = new Map();

function nuevaSesion(companiaId) {
  return {
    companiaId,
    sock: null,
    iniciando: false,
    estado: { status: 'desconectado', qrDataUrl: null, telefono: null },
    debug: { ultimoError: null, ultimoErrorEn: null, intentos: 0, etapa: 'sin_iniciar' },
    // Recuerda que texto corresponde a cada id de fila de lista mandada, por
    // contacto (clave "jid|id"), para poder traducir la respuesta interactiva
    // (que solo trae el id) de vuelta al texto real de la opcion elegida.
    opcionesPorId: new Map(),
  };
}

function obtenerSesion(companiaId) {
  if (!sesiones.has(companiaId)) {
    const s = nuevaSesion(companiaId);
    sesiones.set(companiaId, s);
    iniciarConexion(s);
    return s;
  }
  const s = sesiones.get(companiaId);
  // Si el reintento automatico programado con setTimeout se perdio (por ejemplo
  // porque Passenger suspendio el proceso entre requests, que en shared hosting
  // no mantiene timers corriendo mientras no hay trafico entrante), cualquier
  // request nuevo a esta sesion desconectada la vuelve a intentar en el momento.
  if (s.estado.status === 'desconectado' && !s.iniciando) {
    iniciarConexion(s);
  }
  return s;
}

async function iniciarConexion(s) {
  if (s.iniciando) return;
  s.iniciando = true;
  s.debug.intentos++;
  const authDir = path.join(AUTH_ROOT, String(s.companiaId));

  try {
    s.debug.etapa = 'cargando_auth_state';
    const { state, saveCreds } = await conTimeout(useMultiFileAuthState(authDir), 10000, 'useMultiFileAuthState');

    // fetchLatestBaileysVersion pega a un endpoint externo (github) para saber la
    // ultima version del protocolo. Si el servidor no tiene salida a internet en ese
    // momento o la peticion se cuelga, esto se colgaba para siempre y la conexion
    // jamas avanzaba (ni conectaba ni pedia QR). Con timeout + fallback a la version
    // por defecto de la libreria, un fallo de red ya no bloquea el arranque.
    s.debug.etapa = 'buscando_version';
    let version;
    try {
      ({ version } = await conTimeout(fetchLatestBaileysVersion(), 8000, 'fetchLatestBaileysVersion'));
    } catch (err) {
      s.debug.ultimoError = 'fetchLatestBaileysVersion: ' + err.message;
      s.debug.ultimoErrorEn = new Date().toISOString();
      version = undefined;
    }

    s.debug.etapa = 'creando_socket';
    const sock = makeWASocket({
      version,
      auth: state,
      logger,
      printQRInTerminal: false,
    });
    s.sock = sock;
    s.debug.etapa = 'socket_creado_esperando_eventos';

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        s.estado.status = 'esperando_qr';
        s.estado.qrDataUrl = await QRCode.toDataURL(qr);
        s.estado.telefono = null;
      }

      if (connection === 'open') {
        s.debug.etapa = 'conectado';
        s.estado.status = 'conectado';
        s.estado.qrDataUrl = null;
        s.estado.telefono = sock.user?.id?.split(':')[0] ?? null;
        console.log(`[whatsapp] compania ${s.companiaId} conectada como`, s.estado.telefono);
      }

      if (connection === 'close') {
        const code = lastDisconnect?.error?.output?.statusCode;
        const debeReconectar = code !== DisconnectReason.loggedOut;
        s.debug.etapa = 'conexion_cerrada';
        s.debug.ultimoError = lastDisconnect?.error?.message || String(lastDisconnect?.error || 'sin detalle');
        s.debug.ultimoErrorEn = new Date().toISOString();
        s.estado.status = 'desconectado';
        s.estado.qrDataUrl = null;
        s.estado.telefono = null;
        console.log(`[whatsapp] compania ${s.companiaId} conexion cerrada, codigo:`, code, 'reconectar:', debeReconectar);
        s.iniciando = false;
        if (debeReconectar) {
          setTimeout(() => iniciarConexion(s), 3000);
        }
      }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;
      for (const m of messages) {
        try {
          await procesarMensajeEntrante(s, m);
        } catch (err) {
          console.error(`[whatsapp] compania ${s.companiaId} error procesando mensaje entrante:`, err.message);
        }
      }
    });
  } catch (err) {
    // Cualquier fallo inesperado al arrancar (auth corrupta, error de red, etc.)
    // no debe dejar la sesion colgada para siempre: se libera el flag y se
    // reintenta sola, como ya se hacia para una desconexion normal.
    s.debug.etapa = 'fallo_en_' + s.debug.etapa;
    s.debug.ultimoError = err.message;
    s.debug.ultimoErrorEn = new Date().toISOString();
    console.error(`[whatsapp] compania ${s.companiaId} fallo iniciando la conexion, reintentando en 5s:`, err.message);
    s.iniciando = false;
    setTimeout(() => iniciarConexion(s), 5000);
  }
}

const EXT_POR_TIPO = { imagen: 'jpg', audio: 'ogg', documento: 'bin', video: 'mp4' };

function detectarTipoMedia(message) {
  if (message.imageMessage) return { tipo: 'imagen', node: message.imageMessage };
  if (message.audioMessage) return { tipo: 'audio', node: message.audioMessage };
  if (message.videoMessage) return { tipo: 'video', node: message.videoMessage };
  if (message.documentMessage) return { tipo: 'documento', node: message.documentMessage };
  return null;
}

async function procesarMensajeEntrante(s, m) {
  if (m.key.fromMe) return;
  if (!m.message) return;
  const jid = m.key.remoteJid;
  if (!jid || jid.endsWith('@g.us') || jid === 'status@broadcast') return; // ignorar grupos y estados

  // Si el contacto toco una opcion de lista/botones, Baileys no manda el texto
  // en conversation/extendedTextMessage. El mensaje interactivo nuevo (native_flow,
  // el que realmente WhatsApp sigue respetando) manda el id de la fila elegida en
  // interactiveResponseMessage; el formato viejo (listResponseMessage) queda como
  // respaldo por si algun cliente todavia responde asi. Se busca el id en el mensaje
  // y se resuelve al texto real de la opcion (guardado en optionsPorId) para que el
  // motor de flujos la reconozca igual que si el contacto hubiera escrito la opcion.
  const idElegido = getButtonReplyId(m.message) || getListReplyId(m.message);
  const respuestaInteractiva = idElegido
    ? (s.opcionesPorId?.get(`${jid}|${idElegido}`) || m.message.listResponseMessage?.title || idElegido)
    : null;

  const texto =
    m.message.conversation ||
    m.message.extendedTextMessage?.text ||
    respuestaInteractiva ||
    m.message.imageMessage?.caption ||
    m.message.videoMessage?.caption ||
    '';

  const media = detectarTipoMedia(m.message);
  const telefono = jid.split('@')[0];
  const nombre = m.pushName || null;
  const payload = { telefono, texto, nombre, jid, compania_id: s.companiaId };

  if (media) {
    try {
      const buffer = await downloadMediaMessage(m, 'buffer', {});
      const ext = media.node.mimetype?.split('/')[1]?.split(';')[0] || EXT_POR_TIPO[media.tipo] || 'bin';
      const nombreArchivo = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
      fs.writeFileSync(path.join(MEDIA_DIR, nombreArchivo), buffer);
      payload.tipo_contenido = media.tipo;
      payload.archivo_url = `${PUBLIC_BASE_URL}/media/${nombreArchivo}`;
      if (!texto.trim()) payload.texto = `[${media.tipo}]`;
    } catch (err) {
      console.error('[whatsapp] no se pudo descargar media entrante:', err.message);
      if (!texto.trim()) return; // sin texto y sin poder bajar el archivo, no hay nada que avisar
    }
  } else if (!texto.trim()) {
    return; // tipo de mensaje no soportado (ubicacion, sticker, etc.) y sin texto
  }

  await axios.post(
    LARAVEL_WEBHOOK_URL,
    payload,
    { headers: { 'X-Service-Token': SERVICE_TOKEN }, timeout: 15000 }
  ).catch((err) => {
    console.error('[whatsapp] no se pudo avisar a Laravel:', err.message);
  });
}

// Baileys a veces identifica al remitente por un LID (@lid) en vez de su numero
// real (@s.whatsapp.net) por configuracion de privacidad. Si ya nos pasan un JID
// completo (con "@"), lo respetamos tal cual en vez de asumir siempre @s.whatsapp.net,
// porque reconstruirlo mal hace que el envio falle silenciosamente contra ese contacto.
function jidDeTelefono(telefono) {
  const str = String(telefono);
  if (str.includes('@')) return str;
  const limpio = str.replace(/[^\d]/g, '');
  return `${limpio}@s.whatsapp.net`;
}

// ---- API HTTP ----

const app = express();
app.use(cors());
app.use(express.json());

// En produccion, Passenger (cPanel) enruta /wa-service/* a esta app SIN recortar el prefijo
// (a diferencia de otros setups de reverse proxy). En local no hay prefijo. Se soporta ambos casos.
app.use((req, res, next) => {
  if (req.url.startsWith('/wa-service')) req.url = req.url.slice('/wa-service'.length) || '/';
  next();
});

// Archivos recibidos por WhatsApp (imagenes/audios/documentos de contactos), servidos
// publicamente para que tanto Baileys como el CRM puedan mostrarlos/reenviarlos.
app.use('/media', express.static(MEDIA_DIR));

function requiereToken(req, res, next) {
  if (!SERVICE_TOKEN) return next(); // si no se configuro token, no se exige (solo para desarrollo local)
  if (req.get('X-Service-Token') !== SERVICE_TOKEN) {
    return res.status(401).json({ message: 'Token invalido' });
  }
  next();
}

// La mayoria de los endpoints operan sobre UNA compania (header X-Compania-Id,
// mandado por Laravel en cada request). Se resuelve/crea la sesion correspondiente
// antes de llegar al handler.
function conCompania(req, res, next) {
  const companiaId = parseInt(req.get('X-Compania-Id'), 10);
  if (!companiaId) {
    return res.status(422).json({ message: 'Falta X-Compania-Id' });
  }
  req.sesion = obtenerSesion(companiaId);
  next();
}

app.get('/status', requiereToken, conCompania, (req, res) => {
  res.json({ ...req.sesion.estado, debug: req.sesion.debug });
});

// Estado resumido de todas las sesiones activas en memoria — lo usa el panel de
// super-admin de Laravel para pintar el punto verde/rojo de cada compania. No
// crea sesiones nuevas: solo companias que ya tuvieron al menos un request
// aparecen aca (las que todavia nunca se usaron se ven como no conectadas).
app.get('/status-all', requiereToken, (req, res) => {
  const resumen = {};
  for (const [companiaId, s] of sesiones.entries()) {
    resumen[companiaId] = { status: s.estado.status, telefono: s.estado.telefono };
  }
  res.json(resumen);
});

app.get('/qr', requiereToken, conCompania, (req, res) => {
  res.json({ qr: req.sesion.estado.qrDataUrl });
});

app.post('/disconnect', requiereToken, conCompania, async (req, res) => {
  const s = req.sesion;
  try {
    if (s.sock) {
      await s.sock.logout().catch(() => {});
    }
    s.estado.status = 'desconectado';
    s.estado.qrDataUrl = null;
    s.estado.telefono = null;
    res.json({ message: 'Desconectado' });
    setTimeout(() => iniciarConexion(s), 1000);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/send', requiereToken, conCompania, async (req, res) => {
  const { telefono, mensaje } = req.body;
  const s = req.sesion;
  if (!telefono || !mensaje) {
    return res.status(422).json({ message: 'telefono y mensaje son requeridos' });
  }
  if (s.estado.status !== 'conectado' || !s.sock) {
    return res.status(409).json({ message: 'WhatsApp no esta conectado' });
  }
  try {
    await s.sock.sendMessage(jidDeTelefono(telefono), { text: mensaje });
    res.json({ message: 'Enviado' });
  } catch (err) {
    console.error(`[whatsapp] compania ${s.companiaId} fallo el envio a`, telefono, ':', err.message);
    res.status(500).json({ message: err.message });
  }
});

app.post('/send-media', requiereToken, conCompania, async (req, res) => {
  const { telefono, tipo, url, caption, mimetype } = req.body;
  const s = req.sesion;
  if (!telefono || !tipo || !url) {
    return res.status(422).json({ message: 'telefono, tipo y url son requeridos' });
  }
  if (s.estado.status !== 'conectado' || !s.sock) {
    return res.status(409).json({ message: 'WhatsApp no esta conectado' });
  }
  try {
    const jid = jidDeTelefono(telefono);
    const contenido = {
      imagen: { image: { url }, caption: caption || undefined },
      audio: { audio: { url }, mimetype: mimetype || 'audio/mpeg', ptt: true },
      documento: { document: { url }, mimetype: mimetype || 'application/octet-stream', fileName: caption || 'archivo' },
      video: { video: { url }, caption: caption || undefined },
    }[tipo];
    if (!contenido) return res.status(422).json({ message: 'tipo de media invalido' });

    await s.sock.sendMessage(jid, contenido);
    res.json({ message: 'Enviado' });
  } catch (err) {
    console.error(`[whatsapp] compania ${s.companiaId} fallo el envio de media a`, telefono, ':', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Menu con lista tocable (hasta 10 opciones). No todos los clientes de WhatsApp
// renderizan mensajes interactivos igual — Laravel ya manda el texto con el
// listado numerado incluido, asi que si esto tira error el llamador cae solo a
// mandar ese texto como mensaje comun.
app.post('/send-list', requiereToken, conCompania, async (req, res) => {
  const { telefono, texto, boton, opciones } = req.body;
  const s = req.sesion;
  if (!telefono || !texto || !Array.isArray(opciones) || opciones.length === 0) {
    return res.status(422).json({ message: 'telefono, texto y opciones son requeridos' });
  }
  if (s.estado.status !== 'conectado' || !s.sock) {
    return res.status(409).json({ message: 'WhatsApp no esta conectado' });
  }
  try {
    const jid = jidDeTelefono(telefono);
    const filas = opciones.map((o, i) => ({
      id: String(o.id ?? i),
      title: String(o.texto ?? '').slice(0, 24) || `Opción ${i + 1}`,
    }));
    for (const f of filas) s.opcionesPorId.set(`${jid}|${f.id}`, f.title);

    await sendListaInteractiva(s.sock, jid, {
      text: texto,
      footer: 'Elegí una opción',
      buttonText: boton || 'Ver opciones',
      sections: [{ title: 'Opciones', rows: filas }],
    });
    res.json({ message: 'Enviado' });
  } catch (err) {
    console.error(`[whatsapp] compania ${s.companiaId} fallo el envio de lista a`, telefono, ':', err.message);
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[whatsapp] servicio escuchando en el puerto ${PORT}`);
});
