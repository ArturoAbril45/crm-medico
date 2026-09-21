import { useState } from 'react'
import {
  Link, Tag, MessageSquareText, Users, Clock, Inbox,
  Building2, FileText, CreditCard, Puzzle, Bell, CheckCircle2, Save
} from 'lucide-react'

const secciones = [
  { id: 'conexion', label: 'Conexión', icon: Link },
  { id: 'campos', label: 'Campos', icon: Tag },
  { id: 'respuestas', label: 'Respuestas Rápidas', icon: MessageSquareText },
  { id: 'equipo', label: 'Equipo', icon: Users },
  { id: 'horarios', label: 'Horarios', icon: Clock },
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'empresa', label: 'Empresa', icon: Building2 },
  { id: 'registros', label: 'Registros', icon: FileText },
  { id: 'facturacion', label: 'Facturación', icon: CreditCard },
  { id: 'integraciones', label: 'Integraciones', icon: Puzzle },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
]

function Conexion() {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4 p-5 border border-green-200 bg-green-50 rounded-xl">
        <CheckCircle2 size={24} className="text-green-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-slate-800">Automatización está activa</p>
          <p className="text-sm text-slate-600 mt-0.5">
            El número de WhatsApp <span className="text-indigo-600 font-medium">+591 75136899</span> está conectado a <strong>MedAdvance360</strong>
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Su WhatsApp fue conectado con éxito. La automatización continuará funcionando incluso con el celular apagado.
          </p>
        </div>
        <button className="px-4 py-2 text-sm bg-red-100 text-red-600 hover:bg-red-200 transition-colors font-medium shrink-0 rounded-lg">
          Desconectar
        </button>
      </div>
    </div>
  )
}

function Empresa() {
  const [form, setForm] = useState({
    nombre: 'MedAdvance360', email: 'contacto@medadvance360.com',
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
            <span className={`absolute top-0.5 w-5 h-5 bg-white shadow transition-transform rounded-full ${o.activo ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      ))}
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
  campos: <SeccionVacia label="Campos personalizados" />,
  respuestas: <SeccionVacia label="Respuestas rápidas" />,
  equipo: <SeccionVacia label="Gestión del equipo" />,
  inbox: <SeccionVacia label="Configuración de inbox" />,
  registros: <SeccionVacia label="Registros de actividad" />,
  facturacion: <SeccionVacia label="Facturación y plan" />,
  integraciones: <SeccionVacia label="Integraciones externas" />,
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
