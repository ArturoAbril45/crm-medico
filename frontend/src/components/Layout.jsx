import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, LogOut, ChevronDown, User, Bell, HelpCircle, LifeBuoy, GraduationCap, Calendar, MessageSquare } from 'lucide-react'
import { useState, useRef, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { navGroups } from '../navConfig'
import { getCitas, getConversaciones } from '../services/api'

export default function Layout() {
  const [openGroup, setOpenGroup] = useState(null)
  const [userMenu, setUserMenu] = useState(false)
  const [notifMenu, setNotifMenu] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const navRef = useRef(null)
  const notifRef = useRef(null)

  const hoy = new Date().toISOString().slice(0, 10)
  const { data: citasHoyData } = useQuery({
    queryKey: ['notif-citas-hoy'],
    queryFn: () => getCitas({ fecha: hoy, estado: 'pendiente', per_page: 5 }).then(r => r.data),
    refetchInterval: 60000,
  })
  const { data: conversacionesData } = useQuery({
    queryKey: ['notif-conversaciones'],
    queryFn: () => getConversaciones().then(r => r.data),
    refetchInterval: 15000,
  })
  const citasHoy = citasHoyData?.data ?? []
  const conversaciones = Array.isArray(conversacionesData) ? conversacionesData : []
  const mensajesSinLeer = conversaciones.filter(c => c.no_leidos > 0)
  const totalNotificaciones = citasHoy.length + mensajesSinLeer.length

  useEffect(() => { setOpenGroup(null); setMobileOpen(false) }, [location.pathname])

  useEffect(() => {
    function onClickOutsideNotif(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifMenu(false)
    }
    document.addEventListener('mousedown', onClickOutsideNotif)
    return () => document.removeEventListener('mousedown', onClickOutsideNotif)
  }, [])

  useEffect(() => {
    function onClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenGroup(null)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const initiales = (session?.nombre ?? 'U').split(' ').map(w => w[0]).slice(0, 2).join('')

  // permisos === null/undefined significa acceso completo (rol Administrador
  // o cualquier usuario sin restricciones marcadas en Roles y Usuarios).
  const SIEMPRE_PERMITIDAS = ['/dashboard', '/perfil']
  const permisos = session?.permisos ?? null
  const tienePermiso = (to) => !permisos || SIEMPRE_PERMITIDAS.includes(to) || permisos.includes(to)

  const navGroupsVisibles = useMemo(() => {
    if (!permisos) return navGroups
    return navGroups
      .map(grupo => {
        if (!grupo.items) return tienePermiso(grupo.to) ? grupo : null
        const items = grupo.items.filter(it => tienePermiso(it.to))
        return items.length > 0 ? { ...grupo, items } : null
      })
      .filter(Boolean)
  }, [permisos])

  useEffect(() => {
    if (!permisos) return
    const rutasPermitidas = [...SIEMPRE_PERMITIDAS, ...permisos]
    const permitido = rutasPermitidas.some(r => location.pathname === r || location.pathname.startsWith(r + '/'))
    if (!permitido) navigate('/dashboard', { replace: true })
  }, [location.pathname, permisos])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shrink-0">
        <div className="px-4 lg:px-6 h-16 flex items-center gap-1" ref={navRef}>
          <img src="/logo-clinica.png" alt="MedAdvance360" className="h-14 w-auto object-contain shrink-0" />

          <button className="lg:hidden ml-2 p-1.5 text-slate-500 hover:bg-slate-100 rounded-md" onClick={() => setMobileOpen(v => !v)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <nav className="hidden lg:flex items-center gap-0.5 ml-5">
            {navGroupsVisibles.map((grupo) => {
              if (!grupo.items) {
                return (
                  <NavLink key={grupo.to} to={grupo.to}
                    className={({ isActive }) => `px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ` +
                      (isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100')}>
                    {grupo.label}
                  </NavLink>
                )
              }

              const abierto = openGroup === grupo.label
              const activo = grupo.items.some(it => location.pathname.startsWith(it.to))

              return (
                <div key={grupo.label} className="relative">
                  <button onClick={() => setOpenGroup(abierto ? null : grupo.label)}
                    className={`flex items-center gap-1 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ` +
                      (activo || abierto ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:bg-slate-100')}>
                    {grupo.label}
                    <ChevronDown size={14} className={`transition-transform ${abierto ? 'rotate-180' : ''}`} />
                  </button>

                  {abierto && (
                    <div className="absolute left-0 top-full mt-2 w-[760px] max-w-[92vw] bg-white border border-slate-200 shadow-xl rounded-xl p-3 grid grid-cols-4 gap-1 max-h-[75vh] overflow-y-auto">
                      {grupo.items.map(({ to, icon: Icon, label }) => (
                        <NavLink key={to} to={to}
                          className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors ` +
                            (isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50')}>
                          <span className="w-9 h-9 flex items-center justify-center bg-slate-100 rounded-lg shrink-0">
                            <Icon size={16} />
                          </span>
                          <span className="text-sm font-medium leading-tight">{label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          <div className="flex-1" />

          <div className="hidden lg:flex items-center gap-1">
            <div className="relative" ref={notifRef}>
              <button title="Notificaciones" onClick={() => setNotifMenu(v => !v)}
                className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                <Bell size={18} />
                {totalNotificaciones > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                    {totalNotificaciones}
                  </span>
                )}
              </button>
              {notifMenu && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-700">Notificaciones</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {mensajesSinLeer.map(c => (
                      <button key={`msg-${c.id}`} onClick={() => { navigate('/bandeja'); setNotifMenu(false) }}
                        className="w-full flex items-start gap-2.5 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors border-b border-slate-50">
                        <MessageSquare size={15} className="text-indigo-500 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-slate-700 truncate">{c.nombre || c.telefono}</p>
                          <p className="text-xs text-slate-400 truncate">{c.ultimo_mensaje || 'Mensaje nuevo'}</p>
                        </div>
                      </button>
                    ))}
                    {citasHoy.map(c => (
                      <button key={`cita-${c.id}`} onClick={() => { navigate('/citas'); setNotifMenu(false) }}
                        className="w-full flex items-start gap-2.5 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors border-b border-slate-50">
                        <Calendar size={15} className="text-amber-500 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-slate-700 truncate">Cita pendiente: {c.paciente?.nombre} {c.paciente?.apellido}</p>
                          <p className="text-xs text-slate-400 truncate">{new Date(c.fecha_hora).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </button>
                    ))}
                    {totalNotificaciones === 0 && (
                      <p className="px-4 py-6 text-center text-sm text-slate-400">Sin notificaciones nuevas</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button title="Ayuda" onClick={() => navigate('/herramientas/ayuda')}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
              <HelpCircle size={18} />
            </button>
            <div className="relative">
              <button onClick={() => setUserMenu(m => !m)}
                className="flex items-center gap-2 ml-1 pl-1 pr-2 py-1 hover:bg-slate-100 rounded-full transition-colors">
                <span className="w-8 h-8 bg-indigo-500 text-white flex items-center justify-center rounded-full text-xs font-bold">{initiales}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${userMenu ? 'rotate-180' : ''}`} />
              </button>
              {userMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-800 truncate">{session?.nombre}</p>
                    <p className="text-xs text-slate-400 capitalize">{session?.rol}</p>
                  </div>
                  <button onClick={() => { navigate('/perfil'); setUserMenu(false) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <User size={15} /> Mi Perfil
                  </button>
                  <button onClick={() => { navigate('/herramientas/ayuda'); setUserMenu(false) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <GraduationCap size={15} /> Ver Tutorial
                  </button>
                  <a href="mailto:soporte@medadvanceos.com" onClick={() => setUserMenu(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <LifeBuoy size={15} /> Soporte Técnico
                  </a>
                  <button onClick={() => { logout(); setUserMenu(false) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-slate-100">
                    <LogOut size={15} /> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-100 max-h-[75vh] overflow-y-auto">
            {navGroupsVisibles.map((grupo) => grupo.items ? (
              <details key={grupo.label} className="border-b border-slate-100">
                <summary className="px-4 py-3 text-sm font-semibold text-slate-700 cursor-pointer select-none">{grupo.label}</summary>
                <div className="pb-2">
                  {grupo.items.map(({ to, label }) => (
                    <NavLink key={to} to={to}
                      className={({ isActive }) => `block px-8 py-2 text-sm ` + (isActive ? 'text-indigo-600 font-medium' : 'text-slate-500')}>
                      {label}
                    </NavLink>
                  ))}
                </div>
              </details>
            ) : (
              <NavLink key={grupo.to} to={grupo.to}
                className={({ isActive }) => `block px-4 py-3 text-sm font-semibold border-b border-slate-100 ` + (isActive ? 'text-indigo-600' : 'text-slate-700')}>
                {grupo.label}
              </NavLink>
            ))}
            <button onClick={logout} className="w-full text-left px-4 py-3 text-sm text-red-500 font-medium">Cerrar Sesión</button>
          </div>
        )}
      </header>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
