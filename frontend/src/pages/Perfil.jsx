import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { User, Shield, Globe, LogOut, CheckCircle2, Save, Eye, EyeOff } from 'lucide-react'

const estadoOptions = [
  { id: 'disponible', label: 'Disponible', color: 'bg-green-500' },
  { id: 'ausente', label: 'Ausente', color: 'bg-amber-500' },
  { id: 'ocupado', label: 'Ocupado', color: 'bg-red-500' },
]

export default function Perfil() {
  const { session, logout } = useAuth()
  const [estado, setEstado] = useState('disponible')
  const [guardado, setGuardado] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({
    nombre: session?.nombre ?? '',
    email: session?.user === 'admin' ? 'admin@medadvance360.com' : 'doctor@medadvance360.com',
    telefono: '+591 70000001',
    idioma: 'ES',
    password: '',
  })

  const initiales = (session?.nombre ?? 'U').split(' ').map(w => w[0]).slice(0, 2).join('')

  const guardar = () => { setGuardado(true); setTimeout(() => setGuardado(false), 2000) }

  const estadoActual = estadoOptions.find(e => e.id === estado)

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Mi Perfil</h1>
        <p className="text-sm text-slate-500 mt-0.5">Gestiona tu información personal y preferencias</p>
      </div>

      {/* Avatar + estado */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">{initiales}</span>
            </div>
            <span className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${estadoActual?.color}`} />
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-slate-800">{session?.nombre}</p>
            <p className="text-sm text-slate-500 capitalize">{session?.rol} — Med-Advance</p>
            <p className="text-xs text-slate-400 mt-0.5">ID: {session?.id}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {estadoOptions.map(e => (
              <button key={e.id} onClick={() => setEstado(e.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors ${estado === e.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                <span className={`w-2 h-2 rounded-full ${e.color}`} />
                {e.label}
                {estado === e.id && <CheckCircle2 size={11} className="text-indigo-600" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info personal */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
        <h2 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <User size={16} className="text-indigo-500" /> Información Personal
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
              <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo electrónico</label>
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
        </div>
      </div>

      {/* Seguridad */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
        <h2 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <Shield size={16} className="text-indigo-500" /> Seguridad
        </h2>
        <div className="space-y-4 max-w-sm">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nueva contraseña</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Dejar en blanco para no cambiar"
                className="w-full px-3 py-2 pr-10 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              <button onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Idioma */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
        <h2 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <Globe size={16} className="text-indigo-500" /> Idioma
        </h2>
        <select value={form.idioma} onChange={e => setForm(f => ({ ...f, idioma: e.target.value }))}
          className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
          <option value="ES">Español</option>
          <option value="PT">Português</option>
          <option value="EN">English</option>
        </select>
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-between">
        <button onClick={guardar}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-colors ${guardado ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
          {guardado ? <><CheckCircle2 size={15} /> Guardado</> : <><Save size={15} /> Guardar Cambios</>}
        </button>
        <button onClick={logout}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-xl transition-colors">
          <LogOut size={15} /> Cerrar Sesión
        </button>
      </div>
    </div>
  )
}
