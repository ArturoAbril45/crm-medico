import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Lock, User, RefreshCw, Construction } from 'lucide-react'
import ModuleLoader from '../components/ModuleLoader'

const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function generarCaptcha(len = 5) {
  let out = ''
  for (let i = 0; i < len; i++) out += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]
  return out
}

export default function Login() {
  const { login } = useAuth()
  const [form, setForm] = useState({ user: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [captcha, setCaptcha] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')
  const [showForgotMsg, setShowForgotMsg] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 900)
    return () => clearTimeout(t)
  }, [])

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generarCaptcha())
    setCaptchaInput('')
  }, [])

  useEffect(() => { refreshCaptcha() }, [refreshCaptcha])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (captchaInput.trim().toUpperCase() !== captcha) {
      setError('El código de verificación no coincide')
      refreshCaptcha()
      return
    }

    setLoading(true)
    const ok = await login(form.user, form.password)
    if (!ok) {
      setError('Usuario o contraseña incorrectos')
      refreshCaptcha()
    }
    setLoading(false)
  }

  return (
    <div className="h-screen flex bg-white overflow-y-auto">
      {pageLoading && <ModuleLoader fixed />}

      {/* ── Panel izquierdo: formulario ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-end p-4 lg:pr-4 relative overflow-hidden">
        <div className="relative w-full max-w-md py-4">
          <div className="bg-white/30 backdrop-blur-xl rounded-[2.5rem] shadow-[0_0_25px_rgba(6,182,212,0.10)] border border-white/40 p-6 sm:p-7">
            {/* Logo */}
            <div className="flex flex-col items-center mb-4">
              <img src="/logo-clinica.png" alt="MedAdvance OS" className="h-16 w-auto object-contain mb-2" />
              <p className="text-xs text-slate-500 text-center mt-1">
                Para iniciar sesión, ingresa tu dirección de correo electrónico y contraseña a continuación.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-white/40 backdrop-blur-sm border border-white/50 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
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
                    className="w-full pl-10 pr-10 py-2.5 bg-white/40 backdrop-blur-sm border border-white/50 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Captcha */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Código de verificación</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 h-10 rounded-xl bg-white/50 border border-white/60 overflow-hidden select-none flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <line x1="0" y1="30%" x2="100%" y2="70%" stroke="#64748b" strokeWidth="1" opacity="0.35" />
                      <line x1="0" y1="75%" x2="100%" y2="25%" stroke="#64748b" strokeWidth="1" opacity="0.35" />
                      <line x1="20%" y1="0" x2="60%" y2="100%" stroke="#64748b" strokeWidth="1" opacity="0.25" />
                    </svg>
                    <span className="relative flex gap-1.5 font-mono font-bold text-lg tracking-widest">
                      {captcha.split('').map((c, i) => (
                        <span key={i} className="text-slate-700 inline-block"
                          style={{ transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (8 + i * 3)}deg) translateY(${i % 2 === 0 ? 2 : -2}px)` }}>
                          {c}
                        </span>
                      ))}
                    </span>
                  </div>
                  <button type="button" onClick={refreshCaptcha} title="Generar otro código"
                    className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-white/40 border border-white/50 text-slate-500 hover:text-cyan-600 hover:bg-white/60 transition-colors">
                    <RefreshCw size={16} />
                  </button>
                </div>
                <input
                  type="text"
                  value={captchaInput}
                  onChange={e => setCaptchaInput(e.target.value)}
                  placeholder="Escribe el código"
                  required
                  className="w-full mt-1.5 px-4 py-2.5 bg-white/40 backdrop-blur-sm border border-white/50 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all uppercase"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-cyan-600/60 backdrop-blur-md border border-white/30 text-white rounded-xl text-sm font-semibold hover:bg-cyan-600/80 active:scale-95 transition-all disabled:opacity-60 mt-1 shadow-lg shadow-cyan-200/50">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Ingresando...
                  </span>
                ) : 'Ingresar'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-3">
              <button type="button" onClick={() => setShowForgotMsg(true)}
                className="hover:text-cyan-600 transition-colors">
                ¿Olvidaste tu contraseña?
              </button>
            </p>

          </div>

          <p className="text-center text-slate-500 text-xs mt-3">© 2026 SIDKAP · CRM Med-Advance</p>
        </div>
      </div>

      {/* ── Panel derecho: ilustración ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-white items-center justify-start pl-4">
        <div className="relative flex flex-col items-center text-center px-10">
          <img src="/doctor-login.jpg" alt="Doctor" className="w-[36rem] max-w-full max-h-[85vh] h-auto object-contain rounded-[2rem]" />
        </div>
      </div>

      {/* ── Modal: función no disponible ── */}
      {showForgotMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          onClick={() => setShowForgotMsg(false)}>
          <div className="contents">
          <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-xs p-9 relative text-center"
            onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4">
              <Construction size={28} className="text-cyan-600" />
            </div>
            <p className="text-base font-semibold text-slate-700">Función no disponible aún</p>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Se encuentra en desarrollo por SIDKAP. Muy pronto vas a poder recuperar tu contraseña desde aquí.
            </p>
            <button type="button" onClick={() => setShowForgotMsg(false)}
              className="mt-6 w-full py-2.5 bg-cyan-600 text-white rounded-full text-sm font-semibold hover:bg-cyan-700 transition-colors">
              Entendido
            </button>
          </div>
          </div>
        </div>
      )}
    </div>
  )
}
