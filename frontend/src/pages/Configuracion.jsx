import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Link, Tag, MessageSquareText, Users, Clock, Inbox,
  Building2, FileText, CreditCard, Bell, CheckCircle2, Save,
  SlidersHorizontal, Workflow, Smartphone, X, KeyRound, Sparkles,
  Search, Plus, Trash2, Settings, MoreVertical, Loader2, PhoneOff
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  getWhatsappEstado, getWhatsappQr, desconectarWhatsapp,
  getRespuestasRapidas, createRespuestaRapida, updateRespuestaRapida, deleteRespuestaRapida,
} from '../services/api'

const secciones = [
  { id: 'conexion', label: 'Conexión', icon: Link },
  { id: 'campos', label: 'Campos', icon: SlidersHorizontal },
  { id: 'etiquetas', label: 'Etiquetas', icon: Tag },
  { id: 'respuestas', label: 'Respuestas Rápidas', icon: MessageSquareText },
  { id: 'equipo', label: 'Equipo', icon: Users },
  { id: 'horarios', label: 'Horarios', icon: Clock },
  { id: 'inbox', label: 'Bandeja de entrada', icon: Inbox },
  { id: 'flujosPredeterminados', label: 'Flujos estándar', icon: Workflow },
  { id: 'empresa', label: 'Empresa', icon: Building2 },
  { id: 'registros', label: 'Registros', icon: FileText },
  { id: 'facturacion', label: 'Facturación', icon: CreditCard },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
]

const MODULOS_PERMISO = ['Panel de control', 'Contactos', 'Campañas', 'Transmisión', 'Automatización', 'Flujos de conversación', 'Configuración', 'Bandeja de entrada']

function QrWhatsAppModal({ onClose }) {
  const [qr, setQr] = useState(null)
  const [conectado, setConectado] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    const consultar = async () => {
      try {
        const { data } = await getWhatsappEstado()
        if (data.status === 'conectado') { setConectado(true); return }
        const qrRes = await getWhatsappQr()
        setQr(qrRes.data.qr)
      } catch {
        setQr(null)
      }
    }
    consultar()
    timerRef.current = setInterval(consultar, 3000)
    return () => clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    if (conectado) { clearInterval(timerRef.current); setTimeout(onClose, 1200) }
  }, [conectado])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative text-center" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><X size={18} /></button>
        <p className="font-bold text-lg text-slate-800">Conectar mi WhatsApp</p>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Abrí la opción "Dispositivos vinculados" en la configuración de tu WhatsApp y tocá "Vincular un dispositivo".
          El WhatsApp debería abrir la cámara para escanear el código. Escaneá el QR de abajo para conectar tu WhatsApp.
        </p>
        {conectado ? (
          <div className="my-8 flex flex-col items-center gap-2 text-green-600">
            <CheckCircle2 size={40} />
            <p className="font-medium">¡Conectado!</p>
          </div>
        ) : qr ? (
          <img src={qr} alt="QR" className="mx-auto my-5 w-56 h-56 border border-slate-100" />
        ) : (
          <div className="my-5 w-56 h-56 mx-auto flex items-center justify-center border border-slate-100 text-slate-300">
            <Loader2 size={28} className="animate-spin" />
          </div>
        )}
        <p className="text-xs text-slate-400 mt-1">Por motivos de seguridad, el QR cambia periódicamente.</p>
        <p className="text-xs text-slate-400">Se actualiza automáticamente, no hace falta recargar la página.</p>
        <button onClick={onClose} className="w-full mt-5 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
          Cancelar
        </button>
      </div>
    </div>
  )
}

function ConexionClaude() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('claude_api_key') || '')
  const [conectado, setConectado] = useState(() => !!localStorage.getItem('claude_api_key'))
  const [input, setInput] = useState('')

  const conectar = () => {
    if (!input.trim()) return
    localStorage.setItem('claude_api_key', input.trim())
    setApiKey(input.trim())
    setConectado(true)
    setInput('')
  }
  const desconectar = () => {
    localStorage.removeItem('claude_api_key')
    setApiKey('')
    setConectado(false)
  }

  return (
    <div className="p-5 border border-slate-200 rounded-xl">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
          <Sparkles size={20} className="text-indigo-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800">Conexión con Claude (IA)</p>
          {conectado ? (
            <p className="text-sm text-slate-500 mt-0.5">
              Conectado con la clave <span className="font-mono">••••{apiKey.slice(-4)}</span>
            </p>
          ) : (
            <p className="text-sm text-slate-500 mt-0.5">Conexión extra — pegá tu API key de Anthropic para habilitarla.</p>
          )}

          {conectado ? (
            <button onClick={desconectar}
              className="mt-3 px-4 py-2 text-sm bg-red-100 text-red-600 hover:bg-red-200 transition-colors font-medium rounded-lg">
              Desconectar
            </button>
          ) : (
            <div className="flex items-center gap-2 mt-3">
              <div className="relative flex-1 max-w-xs">
                <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" value={input} onChange={e => setInput(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <button onClick={conectar} disabled={!input.trim()}
                className="px-4 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium rounded-lg">
                Conectar
              </button>
            </div>
          )}
        </div>
        {conectado && <CheckCircle2 size={20} className="text-green-500 shrink-0" />}
      </div>
    </div>
  )
}

function Conexion() {
  const [qrOpen, setQrOpen] = useState(false)
  const { data, refetch } = useQuery({
    queryKey: ['whatsapp-estado'],
    queryFn: () => getWhatsappEstado().then(r => r.data),
    refetchInterval: 5000,
  })

  const conectado = data?.status === 'conectado'

  const desconectar = async () => {
    if (!confirm('¿Desconectar este WhatsApp?')) return
    await desconectarWhatsapp()
    refetch()
  }

  return (
    <div className="space-y-4">
      {conectado ? (
        <div className="border border-green-200 bg-green-50 rounded-xl py-10 flex flex-col items-center text-center px-6">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
            <Smartphone size={26} className="text-green-600" />
          </div>
          <p className="font-semibold text-slate-800">WhatsApp conectado</p>
          <p className="text-sm text-slate-500 mt-1">Número vinculado: <span className="font-mono">{data.telefono}</span></p>
          <button onClick={desconectar}
            className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 text-sm font-medium hover:bg-red-100 transition-colors rounded-lg">
            <PhoneOff size={15} /> Desconectar
          </button>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl py-14 flex flex-col items-center text-center px-6">
          <Smartphone size={40} className="text-slate-300 mb-4" />
          <p className="font-semibold text-slate-800">La automatización no está activa</p>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            Tu WhatsApp no está conectado en esta empresa. Conectá tu WhatsApp para activar la automatización.
          </p>
          <button onClick={() => setQrOpen(true)}
            className="mt-5 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors rounded-lg">
            Conectar mi WhatsApp
          </button>
        </div>
      )}

      <ConexionClaude />

      {qrOpen && <QrWhatsAppModal onClose={() => { setQrOpen(false); refetch() }} />}
    </div>
  )
}

function Empresa() {
  const [form, setForm] = useState({
    nombre: 'Med-Advance', email: 'contacto@clinicasaopaulo.com',
    telefono: '+591 75136899', ciudad: 'Santa Cruz de la Sierra', pais: 'Bolivia',
    descripcion: 'Clínica especializada en cirugía estética y medicina estética.'
  })
  const [guardado, setGuardado] = useState(false)

  const guardar = () => { setGuardado(true); setTimeout(() => setGuardado(false), 2000) }

  return (
    <div className="space-y-5 max-w-lg">
      {[
        { label: 'Nombre de la Clínica', key: 'nombre' },
        { label: 'Email de Contacto', key: 'email' },
        { label: 'Teléfono / WhatsApp', key: 'telefono' },
        { label: 'Ciudad', key: 'ciudad' },
        { label: 'País', key: 'pais' },
      ].map(f => (
        <div key={f.key}>
          <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
          <input value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
        <textarea value={form.descripcion} onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
          rows={3} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
      </div>
      <button onClick={guardar}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg ${guardado ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
        {guardado ? <><CheckCircle2 size={15} /> Guardado</> : <><Save size={15} /> Guardar Cambios</>}
      </button>
    </div>
  )
}

function Horarios() {
  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  const [horarios, setHorarios] = useState(
    dias.map((d, i) => ({ dia: d, activo: i < 5, apertura: '08:00', cierre: '18:00' }))
  )

  return (
    <div className="space-y-2 max-w-lg">
      {horarios.map((h, i) => (
        <div key={h.dia} className="flex items-center gap-4 py-2 border-b border-slate-100">
          <input type="checkbox" checked={h.activo}
            onChange={e => setHorarios(prev => prev.map((x, j) => j === i ? { ...x, activo: e.target.checked } : x))}
            className="w-4 h-4 accent-indigo-600" />
          <span className="w-24 text-sm text-slate-700 font-medium">{h.dia}</span>
          {h.activo ? (
            <>
              <input type="time" value={h.apertura}
                onChange={e => setHorarios(prev => prev.map((x, j) => j === i ? { ...x, apertura: e.target.value } : x))}
                className="px-2 py-1 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              <span className="text-slate-400 text-sm">—</span>
              <input type="time" value={h.cierre}
                onChange={e => setHorarios(prev => prev.map((x, j) => j === i ? { ...x, cierre: e.target.value } : x))}
                className="px-2 py-1 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </>
          ) : (
            <span className="text-sm text-slate-400">Cerrado</span>
          )}
        </div>
      ))}
      <button className="mt-4 flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium rounded-lg">
        <Save size={15} /> Guardar Horarios
      </button>
    </div>
  )
}

function Notificaciones() {
  const [opts, setOpts] = useState([
    { id: 'nuevas', label: 'Nuevas conversaciones', activo: true },
    { id: 'citas', label: 'Recordatorios de citas', activo: true },
    { id: 'pagos', label: 'Nuevos pagos recibidos', activo: false },
    { id: 'campañas', label: 'Resultados de campañas', activo: true },
    { id: 'sistema', label: 'Alertas del sistema', activo: false },
  ])

  const toggle = id => setOpts(prev => prev.map(o => o.id === id ? { ...o, activo: !o.activo } : o))

  return (
    <div className="space-y-3 max-w-md">
      {opts.map(o => (
        <div key={o.id} className="flex items-center justify-between py-3 border-b border-slate-100">
          <span className="text-sm text-slate-700">{o.label}</span>
          <button onClick={() => toggle(o.id)}
            className={`relative inline-flex w-11 h-6 transition-colors rounded-full ${o.activo ? 'bg-indigo-600' : 'bg-slate-200'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white shadow transition-transform rounded-full ${o.activo ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      ))}
    </div>
  )
}

function CrearPopover({ placeholder, textoBoton, onCrear, anchoClase = 'right-0' }) {
  const [abierto, setAbierto] = useState(false)
  const [valor, setValor] = useState('')
  const crear = () => {
    if (!valor.trim()) return
    onCrear(valor.trim())
    setValor('')
    setAbierto(false)
  }
  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button onClick={() => setAbierto(o => !o)}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors rounded-lg">
        <Plus size={14} /> Crear
      </button>
      {abierto && (
        <div className={`absolute ${anchoClase} top-full mt-2 bg-white border border-slate-200 shadow-lg z-30 p-4 w-72 rounded-lg`}>
          <input value={valor} onChange={e => setValor(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && crear()}
            placeholder={placeholder} autoFocus
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          <button onClick={crear} disabled={!valor.trim()}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {textoBoton}
          </button>
        </div>
      )}
    </div>
  )
}

function EmptyGhost({ titulo, sub }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16">
      <img src="/ghost.png" alt="" className="w-14 h-14 mb-4" />
      <p className="font-semibold text-slate-800">{titulo}</p>
      {sub && <p className="text-sm text-slate-400 mt-1 max-w-xs">{sub}</p>}
    </div>
  )
}

function Campos() {
  const [tab, setTab] = useState('usuario')
  const [busqueda, setBusqueda] = useState('')
  const [camposUsuario, setCamposUsuario] = useState([])
  const [camposRobot, setCamposRobot] = useState([])

  const campos = tab === 'usuario' ? camposUsuario : camposRobot
  const setCampos = tab === 'usuario' ? setCamposUsuario : setCamposRobot
  const filtrados = campos.filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex bg-slate-100 p-0.5 rounded-lg text-sm font-medium">
          {[{ v: 'usuario', l: 'Campos de usuario' }, { v: 'robot', l: 'Campos del robot' }].map(o => (
            <button key={o.v} onClick={() => setTab(o.v)}
              className={`px-3.5 py-1.5 rounded-md transition-colors ${tab === o.v ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>
              {o.l}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => { const n = prompt('Nombre de la carpeta:'); }}
            className="px-4 py-2 text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors rounded-lg">
            Añadir nueva carpeta
          </button>
          <CrearPopover placeholder="Nombre del campo" textoBoton="Crear campo"
            onCrear={nombre => setCampos(c => [...c, { id: crypto.randomUUID(), nombre }])} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Todos los campos de {tab === 'usuario' ? 'usuario' : 'robot'} <span className="font-semibold text-slate-700">{filtrados.length}</span></p>
        <div className="relative w-56">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Busca"
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
      </div>

      {filtrados.length === 0 ? (
        <EmptyGhost titulo={`Aún no tiene ningún campo de ${tab === 'usuario' ? 'usuario' : 'robot'} creado`}
          sub={`Ahora podés agregar un nuevo campo de ${tab === 'usuario' ? 'usuario' : 'robot'}`} />
      ) : (
        <div className="border border-slate-100 rounded-lg divide-y divide-slate-50">
          {filtrados.map(c => (
            <div key={c.id} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-sm text-slate-700">{c.nombre}</span>
              <button onClick={() => setCampos(cs => cs.filter(x => x.id !== c.id))} className="p-1.5 text-slate-300 hover:text-red-500">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Etiquetas() {
  const [busqueda, setBusqueda] = useState('')
  const [tags, setTags] = useState([])
  const filtrados = tags.filter(t => t.nombre.toLowerCase().includes(busqueda.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Busca"
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <CrearPopover placeholder="Nombre de la etiqueta" textoBoton="Crear etiqueta"
          onCrear={nombre => setTags(t => [...t, { id: crypto.randomUUID(), nombre: nombre.toUpperCase(), descripcion: '' }])} />
      </div>

      {filtrados.length === 0 ? (
        <EmptyGhost titulo="Aún no hay etiquetas creadas" sub="Creá una para empezar a clasificar tus contactos" />
      ) : (
        <table className="w-full text-sm border border-slate-100 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-left">
              <th className="px-4 py-2.5 font-medium">Nombre</th>
              <th className="px-4 py-2.5 font-medium">Descripción</th>
              <th className="px-4 py-2.5 font-medium text-right">Contactos</th>
              <th className="px-4 py-2.5 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtrados.map(t => (
              <tr key={t.id}>
                <td className="px-4 py-2.5">
                  <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full">{t.nombre}</span>
                </td>
                <td className="px-4 py-2.5 text-slate-400">{t.descripcion || '—'}</td>
                <td className="px-4 py-2.5 text-right text-slate-500 tabular-nums">0</td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => setTags(ts => ts.filter(x => x.id !== t.id))} className="p-1.5 text-slate-300 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function FilaRespuestaRapida({ r, onGuardarMensaje, onEliminar }) {
  const [mensaje, setMensaje] = useState(r.mensaje)
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <div>
        <p className="text-sm font-medium text-slate-700">/{r.atajo}</p>
        <input value={mensaje} onChange={e => setMensaje(e.target.value)}
          onBlur={() => { if (mensaje !== r.mensaje) onGuardarMensaje(mensaje) }}
          placeholder="Mensaje de la respuesta rápida..."
          className="text-xs text-slate-400 mt-0.5 border-0 outline-none w-72 bg-transparent focus:text-slate-600" />
      </div>
      <button onClick={onEliminar} className="p-1.5 text-slate-300 hover:text-red-500">
        <Trash2 size={14} />
      </button>
    </div>
  )
}

function RespuestasRapidas() {
  const qc = useQueryClient()
  const [busqueda, setBusqueda] = useState('')
  const { data, isLoading } = useQuery({ queryKey: ['respuestas-rapidas'], queryFn: () => getRespuestasRapidas().then(r => r.data) })
  const respuestas = data ?? []
  const filtrados = respuestas.filter(r => r.atajo.toLowerCase().includes(busqueda.toLowerCase()))

  const invalidar = () => qc.invalidateQueries({ queryKey: ['respuestas-rapidas'] })
  const mutCrear = useMutation({ mutationFn: createRespuestaRapida, onSuccess: invalidar })
  const mutActualizar = useMutation({ mutationFn: ({ id, d }) => updateRespuestaRapida(id, d), onSuccess: invalidar })
  const mutEliminar = useMutation({ mutationFn: deleteRespuestaRapida, onSuccess: invalidar })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Busca"
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <CrearPopover placeholder="Atajo (ej. saludo)" textoBoton="Crear respuesta"
          onCrear={atajo => mutCrear.mutate({ atajo: atajo.replace(/^\//, ''), mensaje: '' })} />
      </div>

      {isLoading ? null : filtrados.length === 0 ? (
        <EmptyGhost titulo="Todavía no hay respuestas rápidas" sub="Aún no has creado respuestas rápidas" />
      ) : (
        <div className="border border-slate-100 rounded-lg divide-y divide-slate-50">
          {filtrados.map(r => (
            <FilaRespuestaRapida key={r.id} r={r}
              onGuardarMensaje={mensaje => mutActualizar.mutate({ id: r.id, d: { atajo: r.atajo, mensaje } })}
              onEliminar={() => mutEliminar.mutate(r.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function Equipo() {
  const { session } = useAuth()
  const [tab, setTab] = useState('equipo')
  const [mostrarNombres, setMostrarNombres] = useState(false)
  const [miembros, setMiembros] = useState([])
  const [menuAbierto, setMenuAbierto] = useState(null)

  const agregarMiembro = () => {
    const email = prompt('Email del nuevo miembro:')
    if (!email || !email.trim()) return
    setMiembros(m => [...m, {
      id: crypto.randomUUID(), email: email.trim(),
      permisos: Object.fromEntries(MODULOS_PERMISO.map(m => [m, true])),
    }])
  }
  const togglePermiso = (id, modulo) => {
    setMiembros(m => m.map(x => x.id === id ? { ...x, permisos: { ...x.permisos, [modulo]: !x.permisos[modulo] } } : x))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex bg-slate-100 p-0.5 rounded-lg text-sm font-medium">
          {[{ v: 'equipo', l: 'Equipo' }, { v: 'departamentos', l: 'Departamentos' }].map(o => (
            <button key={o.v} onClick={() => setTab(o.v)}
              className={`px-3.5 py-1.5 rounded-md transition-colors ${tab === o.v ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>
              {o.l}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" checked={mostrarNombres} onChange={e => setMostrarNombres(e.target.checked)} className="accent-indigo-600" />
            Mostrar los nombres de los miembros en chats en vivo
          </label>
          <button onClick={agregarMiembro}
            className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors rounded-lg">
            Añadir miembro
          </button>
        </div>
      </div>

      {tab === 'departamentos' ? (
        <EmptyGhost titulo="Todavía no hay departamentos creados" />
      ) : (
        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="bg-slate-800 text-white text-left">
                <th className="px-4 py-2.5 font-medium">E-mail</th>
                {MODULOS_PERMISO.map(m => <th key={m} className="px-2 py-2.5 font-medium text-center text-xs">{m}</th>)}
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{session?.nombre}</p>
                  <p className="text-xs text-indigo-500">Propietario</p>
                  <p className="text-xs text-slate-400">{session?.email ?? '—'}</p>
                </td>
                {MODULOS_PERMISO.map(m => (
                  <td key={m} className="px-2 py-3 text-center">
                    <input type="checkbox" checked disabled className="accent-indigo-600 opacity-60" />
                  </td>
                ))}
                <td></td>
              </tr>
              {miembros.map(mb => (
                <tr key={mb.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">{mb.email}</td>
                  {MODULOS_PERMISO.map(m => (
                    <td key={m} className="px-2 py-3 text-center">
                      <input type="checkbox" checked={mb.permisos[m]} onChange={() => togglePermiso(mb.id, m)} className="accent-indigo-600" />
                    </td>
                  ))}
                  <td className="px-2 py-3 relative">
                    <button onClick={() => setMenuAbierto(menuAbierto === mb.id ? null : mb.id)} className="p-1 text-slate-400 hover:text-slate-700">
                      <MoreVertical size={15} />
                    </button>
                    {menuAbierto === mb.id && (
                      <div className="absolute right-2 top-full mt-1 bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden w-32 z-20">
                        <button onClick={() => { setMiembros(ms => ms.filter(x => x.id !== mb.id)); setMenuAbierto(null) }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50">
                          <Trash2 size={13} /> Quitar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function SeccionVacia({ label }) {
  return (
    <div className="py-16 text-center text-slate-400">
      <p className="font-medium text-slate-500">{label}</p>
      <p className="text-sm mt-1">Configuración disponible próximamente</p>
    </div>
  )
}

const contenidos = {
  conexion: <Conexion />,
  empresa: <Empresa />,
  horarios: <Horarios />,
  notificaciones: <Notificaciones />,
  campos: <Campos />,
  etiquetas: <Etiquetas />,
  respuestas: <RespuestasRapidas />,
  equipo: <Equipo />,
  inbox: <SeccionVacia label="Configuración de inbox" />,
  flujosPredeterminados: <SeccionVacia label="Flujos predeterminados" />,
  registros: <SeccionVacia label="Registros de actividad" />,
  facturacion: <SeccionVacia label="Facturación y plan" />,
}

export default function Configuracion() {
  const [activa, setActiva] = useState('conexion')

  return (
    <div className="flex gap-6 -mt-2">
      {/* Menú lateral */}
      <div className="w-48 shrink-0">
        <h1 className="text-lg font-bold text-slate-800 mb-4">Configuración</h1>
        <nav className="space-y-0.5">
          {secciones.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiva(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left ${activa === id ? 'text-indigo-600 font-semibold bg-indigo-50' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'}`}>
              <Icon size={15} className="shrink-0" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido */}
      <div className="flex-1 bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-5">
          {secciones.find(s => s.id === activa)?.label}
        </h2>
        {contenidos[activa]}
      </div>
    </div>
  )
}
