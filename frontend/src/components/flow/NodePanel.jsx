import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Plus, Trash2, Copy, Search, X, Star, LayoutGrid, Zap, GitBranch,
  GitMerge, Shuffle, Clock, Plug, Sparkles, Type, Image, Video, FileText,
  Music, Save, Power, User, Upload,
} from 'lucide-react'
import { getConfiguracionIaBot } from '../../services/api'

const tiposBloqueContenido = [
  { type: 'texto', label: 'Texto', Icon: Type },
  { type: 'imagen', label: 'Imagen', Icon: Image },
  { type: 'video', label: 'Video', Icon: Video },
  { type: 'archivo', label: 'Archivo', Icon: FileText },
  { type: 'audio', label: 'Audio', Icon: Music },
  { type: 'guardar', label: 'Guardar', Icon: Save },
  { type: 'retraso', label: 'Atraso', Icon: Clock },
  { type: 'autooff', label: 'AutoOff', Icon: Power },
  { type: 'contacto', label: 'Contacto', Icon: User },
]

const nuevoBloque = (type) => {
  if (type === 'retraso') return { type, segundos: 3, escritura: true }
  if (type === 'autooff') return { type }
  if (type === 'guardar') return { type, campo: '' }
  if (type === 'contacto') return { type, nombre: '', telefono: '' }
  if (['imagen', 'video', 'audio', 'archivo'].includes(type)) return { type, url: '', caption: '' }
  return { type: 'texto', texto: '' }
}

const iconos = {
  contenido: { Icon: Star, color: 'text-red-500' },
  menu: { Icon: LayoutGrid, color: 'text-violet-500' },
  condicion: { Icon: GitBranch, color: 'text-amber-500' },
  accion: { Icon: Zap, color: 'text-amber-500' },
  conexion_flujo: { Icon: GitMerge, color: 'text-green-600' },
  randomizer: { Icon: Shuffle, color: 'text-sky-500' },
  retraso_inteligente: { Icon: Clock, color: 'text-orange-500' },
  integracion: { Icon: Plug, color: 'text-pink-500' },
  asistente_gpt: { Icon: Sparkles, color: 'text-teal-500' },
}

const tiposAccion = [
  'Añadir Etiqueta', 'Quitar la etiqueta', 'Añadir evento personalizado',
  'Registro en secuencia', 'Salida de secuencia', 'Configurar/Actualizar el valor de un campo',
  'Asignar conversación', 'Cerrar conversación', 'Enviar notificación al equipo',
]

const integraciones = [
  { id: 'zapier', label: 'Añadir integración de Zapier', emoji: '⚡' },
  { id: 'webhook', label: 'Añadir integración de Webhook', emoji: '🔗' },
  { id: 'google_sheets', label: 'Agregar Hojas de Google', emoji: '📊' },
  { id: 'rd_station', label: 'Añadir integración con RD Station', emoji: '🔶' },
]

const titulos = {
  contenido: 'Editar Contenido', menu: 'Editar Menú', condicion: 'Editar Condición', accion: 'Editar Acción',
  conexion_flujo: 'Editar Conexión de flujo', randomizer: 'Editar Randomizer', retraso_inteligente: 'Editar Retraso inteligente',
  integracion: 'Editar Integración', asistente_gpt: 'Editar Asistente de IA',
}

export default function NodePanel({ node, onClose, onSave }) {
  const [config, setConfig] = useState(node.data.config ?? {})

  useEffect(() => { setConfig(node.data.config ?? {}) }, [node.id])

  const guardar = () => { onSave(node.id, config); onClose() }
  const { Icon, color } = iconos[node.type] ?? { Icon: Star, color: 'text-slate-500' }

  return (
    <div className="absolute inset-y-0 left-0 z-30 w-[380px] bg-white border-r border-slate-200 shadow-xl flex flex-col">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <Icon size={18} className={color} />
          <p className="font-semibold text-slate-800">{(titulos[node.type] ?? 'Editar bloque').replace('Editar ', '')}</p>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700"><X size={18} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {node.type === 'contenido' && <EditorContenido config={config} setConfig={setConfig} />}
        {node.type === 'menu' && <EditorMenu config={config} setConfig={setConfig} />}
        {node.type === 'condicion' && <EditorCondicion config={config} setConfig={setConfig} />}
        {node.type === 'accion' && <EditorAccion config={config} setConfig={setConfig} />}
        {node.type === 'conexion_flujo' && <EditorConexionFlujo config={config} setConfig={setConfig} />}
        {node.type === 'randomizer' && <EditorRandomizer config={config} setConfig={setConfig} />}
        {node.type === 'retraso_inteligente' && <EditorRetrasoInteligente config={config} setConfig={setConfig} />}
        {node.type === 'integracion' && <EditorIntegracion config={config} setConfig={setConfig} />}
        {node.type === 'asistente_gpt' && <EditorAsistenteGpt config={config} setConfig={setConfig} />}
      </div>

      <div className="flex gap-3 px-4 py-3.5 border-t border-slate-100 shrink-0">
        <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
        <button onClick={guardar} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Guardar</button>
      </div>
    </div>
  )
}

function EditorContenido({ config, setConfig }) {
  const bloques = config.bloques ?? []
  const set = (next) => setConfig(c => ({ ...c, bloques: next }))
  const agregar = (type) => set([...bloques, nuevoBloque(type)])
  const actualizar = (i, patch) => set(bloques.map((b, j) => j === i ? { ...b, ...patch } : b))
  const eliminar = (i) => set(bloques.filter((_, j) => j !== i))
  const duplicar = (i) => set([...bloques.slice(0, i + 1), { ...bloques[i] }, ...bloques.slice(i + 1)])
  const pacienteCampos = ['nombre', 'apellido', 'email', 'numero_documento', 'notas', 'direccion_linea1', 'ciudad']

  return (
    <div className="space-y-3">
      {bloques.map((b, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2.5 space-y-2">
            {b.type === 'retraso' && (
              <>
                <p className="text-xs font-medium text-slate-600">Retraso</p>
                <p className="text-[11px] text-slate-400">Por favor, seleccioná la duración del retraso</p>
                <div className="flex items-center gap-3">
                  <input type="range" min="0" max="6" step="1" value={b.segundos}
                    onChange={e => actualizar(i, { segundos: Number(e.target.value) })}
                    className="flex-1 accent-red-500" />
                  <span className="text-sm font-semibold text-slate-700 w-14 text-right">{b.segundos} Seg</span>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={b.escritura ?? true}
                    onChange={e => actualizar(i, { escritura: e.target.checked })}
                    className="accent-red-500" />
                  Habilitar la escritura
                </label>
              </>
            )}

            {b.type === 'texto' && (
              <textarea value={b.texto} onChange={e => actualizar(i, { texto: e.target.value })}
                rows={2} placeholder="Mensaje..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            )}

            {['imagen', 'video', 'audio', 'archivo'].includes(b.type) && (
              <>
                <p className="text-xs font-medium text-slate-600">
                  {{ imagen: 'Imagen', video: 'Video', audio: 'Audio', archivo: 'Archivo' }[b.type]}
                </p>
                <input value={b.url ?? ''} onChange={e => actualizar(i, { url: e.target.value })}
                  placeholder="https://... (URL directa del archivo)"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                {b.type !== 'audio' && (
                  <input value={b.caption ?? ''} onChange={e => actualizar(i, { caption: e.target.value })}
                    placeholder="Descripción (opcional)"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                )}
                <p className="text-[11px] text-slate-400 flex items-center gap-1"><Upload size={11} /> Se envía como archivo real de WhatsApp al llegar a este paso.</p>
              </>
            )}

            {b.type === 'guardar' && (
              <>
                <p className="text-xs font-medium text-slate-600">Guardar respuesta</p>
                <select value={b.campo ?? ''} onChange={e => actualizar(i, { campo: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300">
                  <option value="">Elegí un campo del contacto...</option>
                  {pacienteCampos.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <p className="text-[11px] text-slate-400">Guarda el último mensaje que envió el contacto en este campo.</p>
              </>
            )}

            {b.type === 'autooff' && (
              <>
                <p className="text-xs font-medium text-slate-600">AutoOff</p>
                <p className="text-[11px] text-slate-400">Apaga la automatización de esta conversación al llegar acá — un agente humano toma el control.</p>
              </>
            )}

            {b.type === 'contacto' && (
              <>
                <p className="text-xs font-medium text-slate-600">Contacto</p>
                <input value={b.nombre ?? ''} onChange={e => actualizar(i, { nombre: e.target.value })} placeholder="Nombre"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                <input value={b.telefono ?? ''} onChange={e => actualizar(i, { telefono: e.target.value })} placeholder="Teléfono"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <button onClick={() => duplicar(i)} className="p-2 text-slate-300 hover:text-indigo-500"><Copy size={14} /></button>
            <button onClick={() => eliminar(i)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
          </div>
        </div>
      ))}

      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Añadir bloque</p>
        <div className="grid grid-cols-3 gap-2">
          {tiposBloqueContenido.map(({ type, label, Icon }) => (
            <button key={type} onClick={() => agregar(type)}
              className="flex flex-col items-center gap-1.5 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors">
              <Icon size={18} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function EditorMenu({ config, setConfig }) {
  const opciones = config.opciones ?? []
  const set = (k, v) => setConfig(c => ({ ...c, [k]: v }))
  const setOp = (next) => setConfig(c => ({ ...c, opciones: next }))
  const agregar = () => setOp([...opciones, { id: crypto.randomUUID(), texto: '' }])
  const actualizar = (i, texto) => setOp(opciones.map((o, j) => j === i ? { ...o, texto } : o))
  const eliminar = (i) => setOp(opciones.filter((_, j) => j !== i))

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {[{ v: 'lista', l: 'Botón de lista' }, { v: 'numero', l: 'Número' }].map(o => (
          <label key={o.v} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="radio" checked={(config.tipo ?? 'lista') === o.v} onChange={() => set('tipo', o.v)} className="accent-violet-600" />
            {o.l}
          </label>
        ))}
      </div>

      <div>
        <label className="text-xs font-medium text-slate-600 block mb-1">Texto de la pregunta</label>
        <textarea value={config.pregunta ?? ''} onChange={e => set('pregunta', e.target.value)}
          rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-300" />
      </div>

      <div>
        <label className="text-xs font-medium text-slate-600 block mb-1">Título del botón</label>
        <input value={config.tituloBoton ?? ''} onChange={e => set('tituloBoton', e.target.value)}
          placeholder="ej. ¡Opciones!"
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
      </div>

      <div>
        <p className="text-xs font-medium text-slate-600 mb-1.5">Respuestas</p>
        <div className="space-y-2">
          {opciones.map((o, i) => (
            <div key={o.id} className="flex items-center gap-2">
              <input value={o.texto} onChange={e => actualizar(i, e.target.value)}
                placeholder={`Respuesta ${i + 1}`}
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
              <button onClick={() => eliminar(i)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <button onClick={agregar} className="mt-2 flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700">
          <Plus size={13} /> Añadir nueva respuesta
        </button>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-600 block mb-1">Texto para entrada inválida</label>
        <textarea value={config.textoEntradaInvalida ?? ''} onChange={e => set('textoEntradaInvalida', e.target.value)}
          rows={2} placeholder="Se muestra si la respuesta no coincide con ninguna opción"
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-300" />
      </div>

      <div className="border-t border-slate-100 pt-3 space-y-2">
        <p className="text-xs font-semibold text-slate-600">Salida de error</p>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Limitar la cantidad de errores y después usar salida adicional:</span>
          <input type="number" min="1" value={config.limitarErrores ?? 3}
            onChange={e => set('limitarErrores', Number(e.target.value))}
            className="w-14 border border-slate-200 rounded-lg px-2 py-1 text-sm" />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3 space-y-2">
        <p className="text-xs font-semibold text-slate-600">Si el usuario no responde</p>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>El mensaje expira en</span>
          <input type="number" min="1" value={config.expiraDias ?? 1}
            onChange={e => set('expiraDias', Number(e.target.value))}
            className="w-14 border border-slate-200 rounded-lg px-2 py-1 text-sm" />
          <span>día(s)</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Podés conectar esta rama a otro bloque para iniciar algo distinto cuando el tiempo expire sin respuesta.
        </p>
      </div>
    </div>
  )
}

function EditorCondicion({ config, setConfig }) {
  const set = (k, v) => setConfig(c => ({ ...c, [k]: v }))
  return (
    <div className="grid grid-cols-3 gap-3">
      <div>
        <label className="text-xs font-medium text-slate-600 block mb-1">Campo</label>
        <input value={config.campo ?? ''} onChange={e => set('campo', e.target.value)} placeholder="estado"
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600 block mb-1">Operador</label>
        <select value={config.operador ?? '=='} onChange={e => set('operador', e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white">
          <option value="==">es igual a</option>
          <option value="!=">es distinto de</option>
          <option value="contiene">contiene</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600 block mb-1">Valor</label>
        <input value={config.valor ?? ''} onChange={e => set('valor', e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
      </div>
    </div>
  )
}

function EditorAccion({ config, setConfig }) {
  const set = (k, v) => setConfig(c => ({ ...c, [k]: v }))
  const [busqueda, setBusqueda] = useState('')
  const filtradas = tiposAccion.filter(t => t.toLowerCase().includes(busqueda.toLowerCase()))

  if (!config.tipoAccion) {
    return (
      <div>
        <p className="text-sm font-medium text-slate-700 bg-amber-50 border border-dashed border-amber-300 rounded-xl px-4 py-3 text-center mb-3">
          Añadir Acción
        </p>
        <div className="relative mb-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Busca"
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300" />
        </div>
        <div className="border border-slate-100 rounded-lg divide-y divide-slate-50 max-h-56 overflow-y-auto">
          {filtradas.map(t => (
            <button key={t} onClick={() => set('tipoAccion', t)}
              className="w-full text-left px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
              {t}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">{config.tipoAccion}</p>
        <button onClick={() => set('tipoAccion', '')} className="text-xs text-slate-400 hover:text-red-500">Cambiar</button>
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600 block mb-1">Valor</label>
        <input value={config.valor ?? ''} onChange={e => set('valor', e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
      </div>
    </div>
  )
}

function EditorConexionFlujo({ config, setConfig }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 block mb-1">Nombre del flujo a conectar</label>
      <input value={config.nombreFlujo ?? ''} onChange={e => setConfig(c => ({ ...c, nombreFlujo: e.target.value }))}
        placeholder="ej. Flujo de bienvenida"
        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
      <p className="text-[11px] text-slate-400 mt-1.5">
        Al llegar a este bloque, la conversación continúa en el flujo indicado.
      </p>
    </div>
  )
}

function EditorRandomizer({ config, setConfig }) {
  const ramas = config.ramas ?? [{ id: 'a', porcentaje: 50 }, { id: 'b', porcentaje: 50 }]
  const set = (next) => setConfig(c => ({ ...c, ramas: next }))
  const actualizar = (i, porcentaje) => set(ramas.map((r, j) => j === i ? { ...r, porcentaje } : r))
  const agregar = () => set([...ramas, { id: String.fromCharCode(97 + ramas.length), porcentaje: 0 }])
  const eliminar = (i) => ramas.length > 2 && set(ramas.filter((_, j) => j !== i))

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-600 block mb-1">Ramas y su probabilidad</label>
      {ramas.map((r, i) => (
        <div key={r.id} className="flex items-center gap-2">
          <span className="text-sm text-slate-600 w-16">Rama {r.id.toUpperCase()}</span>
          <input type="number" min="0" max="100" value={r.porcentaje}
            onChange={e => actualizar(i, Number(e.target.value))}
            className="w-20 border border-slate-200 rounded-lg px-2 py-1 text-sm" />
          <span className="text-xs text-slate-400">%</span>
          {ramas.length > 2 && (
            <button onClick={() => eliminar(i)} className="p-1.5 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
          )}
        </div>
      ))}
      <button onClick={agregar} className="flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-700">
        <Plus size={13} /> Rama
      </button>
    </div>
  )
}

function EditorRetrasoInteligente({ config, setConfig }) {
  const set = (k, v) => setConfig(c => ({ ...c, [k]: v }))
  const modo = config.modo ?? 'retraso'
  const unidad = config.unidad ?? 'minutos'
  const maximos = { minutos: 30 * 24 * 60, horas: 30 * 24, dias: 30 }

  return (
    <div className="space-y-4">
      <div className="flex bg-slate-100 p-0.5 rounded-lg text-sm font-medium w-fit">
        {[{ v: 'retraso', l: 'Retraso' }, { v: 'fecha', l: 'Fecha y hora' }].map(o => (
          <button key={o.v} onClick={() => set('modo', o.v)}
            className={`px-4 py-1.5 rounded-md transition-colors ${modo === o.v ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>
            {o.l}
          </button>
        ))}
      </div>

      {modo === 'retraso' ? (
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Duración del retraso (30 días como máximo).</p>
          <div className="flex gap-2">
            <input type="number" min="0" max={maximos[unidad]} value={config.cantidad ?? 0}
              onChange={e => set('cantidad', Number(e.target.value))}
              className="w-24 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            <select value={unidad} onChange={e => set('unidad', e.target.value)}
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white">
              <option value="minutos">Minutos</option>
              <option value="horas">Horas</option>
              <option value="dias">Días</option>
            </select>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Continuar en la fecha y hora indicadas</p>
          <div className="flex gap-2">
            <input type="date" value={config.fecha ?? ''} onChange={e => set('fecha', e.target.value)}
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            <input type="time" value={config.hora ?? ''} onChange={e => set('hora', e.target.value)}
              className="w-32 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
          </div>
        </div>
      )}
    </div>
  )
}

function EditorIntegracion({ config, setConfig }) {
  const set = (k, v) => setConfig(c => ({ ...c, [k]: v }))
  const seleccionada = integraciones.find(i => i.id === config.tipo)

  if (!seleccionada) {
    return (
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Añadir método de integración</p>
        <div className="space-y-2">
          {integraciones.map(i => (
            <button key={i.id} onClick={() => set('tipo', i.id)}
              className="w-full flex items-center gap-2 px-4 py-3 bg-pink-50 hover:bg-pink-100 text-pink-700 text-sm font-medium rounded-xl transition-colors">
              {i.label} <span>{i.emoji}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">{seleccionada.label} {seleccionada.emoji}</p>
        <button onClick={() => set('tipo', '')} className="text-xs text-slate-400 hover:text-red-500">Cambiar</button>
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600 block mb-1">URL / endpoint</label>
        <input value={config.url ?? ''} onChange={e => set('url', e.target.value)}
          placeholder="https://..."
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
      </div>
      <p className="text-[11px] text-slate-400">
        Esta integración es una demostración visual — la conexión real con {seleccionada.label.split(' de ')[1] ?? seleccionada.label} todavía no está implementada.
      </p>
    </div>
  )
}

function EditorAsistenteGpt({ config, setConfig }) {
  const set = (k, v) => setConfig(c => ({ ...c, [k]: v }))
  const { data: iaBot } = useQuery({ queryKey: ['config-ia-bot'], queryFn: () => getConfiguracionIaBot().then(r => r.data) })
  const mensajeInicial = config.mensajeInicialTexto ?? ''

  return (
    <div className="space-y-4">
      {iaBot && !(iaBot.tiene_api_key && iaBot.activo) && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          {!iaBot.tiene_api_key
            ? 'Todavía no cargaste una API key. '
            : 'La IA está desactivada. '}
          Andá a Herramientas → WhatsApp AI Bot para {!iaBot.tiene_api_key ? 'cargarla' : 'activarla'}.
        </p>
      )}

      <div>
        <label className="text-xs font-medium text-slate-600 block mb-1">Nombre del asistente</label>
        <input value={config.nombre ?? ''} onChange={e => set('nombre', e.target.value)}
          placeholder="ej. Asistente de consultas"
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
      </div>

      <div>
        <label className="text-xs font-medium text-slate-600 block mb-1.5">Mensaje inicial</label>
        <div className="flex gap-4 mb-2">
          {[{ v: 'contacto', l: 'Para el contacto' }, { v: 'ia', l: 'Para la IA' }].map(o => (
            <label key={o.v} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="radio" checked={(config.mensajeInicialDestino ?? 'contacto') === o.v}
                onChange={() => set('mensajeInicialDestino', o.v)} className="accent-teal-600" />
              {o.l}
            </label>
          ))}
        </div>
        <textarea value={mensajeInicial} onChange={e => set('mensajeInicialTexto', e.target.value.slice(0, 1000))}
          rows={3} placeholder="Un asistente te responderá ahora, podés preguntar lo que quieras"
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-300" />
        <span className="text-[11px] text-slate-400 block text-right mt-0.5">{mensajeInicial.length}/1000</span>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-600 block mb-1">Idioma</label>
        <select value={config.idioma ?? 'es'} onChange={e => set('idioma', e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white">
          <option value="es">Español</option>
          <option value="en">Inglés</option>
          <option value="pt">Portugués</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-600 block mb-1">Temperatura — qué tan creativas o precisas deben ser las respuestas</label>
        <div className="flex items-center gap-3">
          <input type="range" min="0" max="2" step="0.1" value={config.temperatura ?? 1}
            onChange={e => set('temperatura', Number(e.target.value))}
            className="flex-1 accent-teal-500" />
          <span className="text-sm font-semibold text-slate-700 w-8 text-right">{config.temperatura ?? 1}</span>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-600 block mb-1">Instrucciones del asistente</label>
        <textarea value={config.instrucciones ?? ''} onChange={e => set('instrucciones', e.target.value)}
          rows={3} placeholder="ej. Sos un asistente amable que ayuda a los usuarios a entender los planes de la clínica..."
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-300" />
      </div>

      <div className="border border-teal-100 bg-teal-50/50 rounded-xl p-3">
        <label className="text-xs font-medium text-slate-600 block mb-1">Información de referencia sobre tu empresa</label>
        <textarea value={config.conocimiento ?? ''} onChange={e => set('conocimiento', e.target.value)}
          rows={4} placeholder="Pegá acá horarios, precios, direcciones, preguntas frecuentes... El asistente lo va a usar para responder."
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none bg-white focus:outline-none focus:ring-2 focus:ring-teal-300" />
      </div>

      <div className="border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-slate-600">Tiempo de espera para agrupar mensajes</label>
          <button type="button" onClick={() => set('agruparMensajes', !config.agruparMensajes)}
            className={`relative shrink-0 w-9 h-5 rounded-full transition-colors ${config.agruparMensajes ? 'bg-teal-500' : 'bg-slate-300'}`}>
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${config.agruparMensajes ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </div>
        {config.agruparMensajes && (
          <div className="flex items-center gap-2">
            <input type="number" min="1" max="8" value={config.tiempoEsperaSegundos ?? 5}
              onChange={e => set('tiempoEsperaSegundos', Number(e.target.value))}
              className="w-20 border border-slate-200 rounded-lg px-2 py-1.5 text-sm" />
            <span className="text-xs text-slate-500">Segundos (máximo 8)</span>
          </div>
        )}
        <p className="text-[11px] text-slate-400 mt-1">Si el contacto manda varios mensajes seguidos, espera este tiempo y los responde juntos.</p>
      </div>

      <div className="border-t border-slate-100 pt-3">
        <label className="text-xs font-medium text-slate-600 block mb-1">Criterio de éxito del asistente</label>
        <textarea value={config.criterioExito ?? ''} onChange={e => set('criterioExito', e.target.value)}
          rows={2} placeholder='ej. "El usuario confirmó que ya no tiene más dudas, o dijo gracias/eso era todo"'
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-300" />
        <p className="text-[11px] text-slate-400 mt-1">Cuando se cumpla, el asistente deja de responder libremente y el flujo continúa al siguiente bloque.</p>
      </div>
    </div>
  )
}
