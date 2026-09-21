import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { HeartPulse, Eye, EyeOff, Lock, User } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const [form, setForm] = useState({ user: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const ok = await login(form.user, form.password)
    if (!ok) setError('Usuario o contraseña incorrectos')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-white">
      {/* SVG decorativo: círculos y líneas */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        {/* Círculos grandes */}
        <circle cx="10%" cy="15%" r="180" fill="none" stroke="#6366f1" strokeWidth="1" opacity="0.12" />
        <circle cx="10%" cy="15%" r="120" fill="none" stroke="#6366f1" strokeWidth="1" opacity="0.10" />
        <circle cx="10%" cy="15%" r="60"  fill="none" stroke="#6366f1" strokeWidth="1" opacity="0.08" />

        <circle cx="90%" cy="80%" r="220" fill="none" stroke="#818cf8" strokeWidth="1" opacity="0.12" />
        <circle cx="90%" cy="80%" r="150" fill="none" stroke="#818cf8" strokeWidth="1" opacity="0.09" />
        <circle cx="90%" cy="80%" r="80"  fill="none" stroke="#818cf8" strokeWidth="1" opacity="0.07" />

        <circle cx="75%" cy="10%" r="100" fill="none" stroke="#6366f1" strokeWidth="1" opacity="0.08" />
        <circle cx="20%" cy="85%" r="130" fill="none" stroke="#a5b4fc" strokeWidth="1" opacity="0.10" />

        {/* Líneas diagonales sutiles */}
        <line x1="0" y1="30%" x2="40%" y2="0"   stroke="#6366f1" strokeWidth="0.8" opacity="0.07" />
        <line x1="0" y1="60%" x2="60%" y2="0"   stroke="#6366f1" strokeWidth="0.8" opacity="0.05" />
        <line x1="60%" y1="100%" x2="100%" y2="40%" stroke="#6366f1" strokeWidth="0.8" opacity="0.07" />
        <line x1="30%" y1="100%" x2="100%" y2="60%" stroke="#6366f1" strokeWidth="0.8" opacity="0.05" />

        {/* Puntos decorativos */}
        <circle cx="85%" cy="25%" r="4" fill="#6366f1" opacity="0.15" />
        <circle cx="82%" cy="28%" r="2" fill="#6366f1" opacity="0.10" />
        <circle cx="15%" cy="70%" r="4" fill="#818cf8" opacity="0.15" />
        <circle cx="18%" cy="73%" r="2" fill="#818cf8" opacity="0.10" />
        <circle cx="50%" cy="5%"  r="3" fill="#6366f1" opacity="0.12" />
        <circle cx="50%" cy="95%" r="3" fill="#6366f1" opacity="0.12" />
      </svg>

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img src="/logo-clinica.png" alt="MedAdvance360" className="h-24 w-auto object-contain mb-3" />
            <p className="text-sm text-slate-400 mt-0.5">Ingresa a tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Usuario */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Usuario</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.user}
                  onChange={e => setForm(f => ({ ...f, user: e.target.value }))}
                  placeholder="admin"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-60 mt-2 shadow-lg shadow-indigo-200">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Ingresando...
                </span>
              ) : 'Ingresar'}
            </button>
          </form>

        </div>

        <p className="text-center text-slate-500 text-xs mt-6">© 2024 MedAdvance360 · CRM Médico</p>
      </div>
    </div>
  )
}
