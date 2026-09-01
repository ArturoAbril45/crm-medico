import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Calendar, Stethoscope,
  GitBranch, Zap, CreditCard, HeartPulse, Menu, X, LogOut, ChevronDown, ChevronsLeft, ChevronsRight,
  Inbox, Megaphone, Radio, Settings, LayoutTemplate, User, Bell, HelpCircle
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Panel de Control' },
  { to: '/pacientes', icon: Users, label: 'Pacientes' },
  { to: '/campanhas', icon: Megaphone, label: 'Campañas' },
  { to: '/transmision', icon: Radio, label: 'Transmisión' },
  { to: '/bandeja', icon: Inbox, label: 'Bandeja de Entrada' },
  { to: '/automatizaciones', icon: Zap, label: 'Automatización' },
  { to: '/flujos', icon: GitBranch, label: 'Flujos de Conversación' },
  { to: '/configuracion', icon: Settings, label: 'Configuración' },
  { to: '/modelos', icon: LayoutTemplate, label: 'Modelos' },
]

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const { session, logout } = useAuth()
  const navigate = useNavigate()

  const initiales = (session?.nombre ?? 'U').split(' ').map(w => w[0]).slice(0, 2).join('')

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        style={{ background: 'var(--sidebar-bg)' }}
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-200 border-r border-slate-200 shadow-sm
          lg:relative lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          ${collapsed ? 'w-16' : 'w-64'}
        `}
      >
        {/* Logo + botón colapsar */}
        <div className={`flex items-center ${collapsed ? 'justify-center px-2 py-4' : 'gap-2 px-4 py-4'}`}>
          {collapsed ? (
            <button
              className="hidden lg:flex p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors rounded"
              onClick={() => setCollapsed(false)}
              title="Expandir menú"
            >
              <ChevronsRight size={18} />
            </button>
          ) : (
            <>
              <img src="/logo-clinica.png" alt="MedAdvance OS" className="h-10 w-auto object-contain" />
              <div className="flex-1" />
              <button
                className="hidden lg:flex p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors rounded"
                onClick={() => setCollapsed(true)}
                title="Colapsar menú"
              >
                <ChevronsLeft size={18} />
              </button>
            </>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
              title={collapsed ? label : ''}
              className={({ isActive }) =>
                `flex items-center gap-3 transition-colors mb-0.5 text-sm font-medium ` +
                (collapsed ? 'justify-center mx-2 px-2 py-2.5' : 'mx-3 px-3 py-2.5') + ' ' +
                (isActive ? 'bg-indigo-600 text-white rounded-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md')
              }>
              <Icon size={18} className="shrink-0" />
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        {/* Usuario + Cerrar Sesión */}
        {!collapsed && (
          <div className="border-t border-slate-200 p-3">
            <div className="relative">
              <button
                onClick={() => setUserMenu(m => !m)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-100 transition-colors rounded-md"
              >
                <div className="w-8 h-8 bg-indigo-500 flex items-center justify-center shrink-0 rounded-full">
                  <span className="text-white font-bold text-xs">{initiales}</span>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-slate-800 text-sm font-medium truncate">{session?.nombre}</p>
                  <p className="text-slate-400 text-xs capitalize">{session?.rol}</p>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform shrink-0 ${userMenu ? 'rotate-180' : ''}`} />
              </button>

              {userMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-slate-200 overflow-hidden shadow-lg rounded-md">
                  <button
                    onClick={() => { navigate('/perfil'); setUserMenu(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <User size={16} />
                    Mi Perfil
                  </button>
                  <button
                    onClick={() => { logout(); setUserMenu(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {collapsed && (
          <div className="border-t border-slate-200 py-3 flex justify-center">
            <button onClick={logout} title="Cerrar sesión" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-md">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </aside>

      {/* Overlay móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shrink-0">
          {/* Botón abrir sidebar — móvil */}
          <button
            className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex-1" />

          {/* Header derecho: notificaciones + ayuda + avatar */}
          <div className="flex items-center gap-1">
            <button title="Notificaciones" className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors rounded-md">
              <Bell size={18} />
            </button>
            <button title="Ayuda" className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors rounded-md">
              <HelpCircle size={18} />
            </button>
            <button
              onClick={() => navigate('/perfil')}
              title="Ver perfil"
              className="relative w-9 h-9 bg-indigo-500 flex items-center justify-center hover:bg-indigo-600 transition-colors rounded-full ml-1"
            >
              <span className="text-white font-bold text-xs">{initiales}</span>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
            </button>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
