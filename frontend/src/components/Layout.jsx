import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'
import {
  LayoutDashboard, Users, Stethoscope,
  GitBranch, Zap, CreditCard, HeartPulse, Menu, X, LogOut, ChevronDown, ChevronRight, ChevronsLeft, ChevronsRight,
  Inbox, Megaphone, Radio, Settings, LayoutTemplate, Bell, HelpCircle,
  CheckCircle2, Clock, Globe, KeyRound, Check, UserSquare2, CalendarClock, UserCog,
  Clock4, Armchair, Tv, ClipboardList, Building2, ScanLine, Brain, Calculator,
  Store, Sparkles, Package, Truck, ShoppingCart, PackageSearch, FileQuestion, Wrench, Landmark, Shield, Bot, FileText, GraduationCap
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Panel de Control' },
  {
    label: 'CRM', icon: Users, children: [
      { to: '/pacientes', icon: Users, label: 'Contactos' },
      { to: '/bandeja', icon: Inbox, label: 'Bandeja de Entrada' },
      { to: '/campanhas', icon: Megaphone, label: 'Campañas' },
      { to: '/transmision', icon: Radio, label: 'Transmisión' },
      { to: '/automatizaciones', icon: Zap, label: 'Automatización' },
      { to: '/flujos', icon: GitBranch, label: 'Flujos de Conversación' },
      { to: '/configuracion', icon: Settings, label: 'Configuración' },
    ]
  },
  {
    label: 'Clínica Médica', icon: Stethoscope, children: [
      { to: '/clinica/pacientes', icon: UserSquare2, label: 'Pacientes' },
      { to: '/clinica/turnos', icon: CalendarClock, label: 'Turnos' },
      { to: '/clinica/medicos', icon: UserCog, label: 'Médicos' },
      { to: '/clinica/horarios', icon: Clock4, label: 'Horarios' },
      { to: '/clinica/sala-espera', icon: Armchair, label: 'Control de Sala' },
      { to: '/clinica/monitor', icon: Tv, label: 'Monitor TV' },
      { to: '/clinica/consultas', icon: ClipboardList, label: 'Consultas' },
      { to: '/clinica/departamentos', icon: Building2, label: 'Departamentos' },
      { to: '/clinica/informes-imagenes', icon: ScanLine, label: 'Informes de Imágenes' },
      { to: '/clinica/psiquiatria', icon: Brain, label: 'Psiquiatría' },
      { to: '/clinica/psicologia', icon: Brain, label: 'Psicología' },
    ]
  },
  {
    label: 'Finanzas', icon: CreditCard, children: [
      { to: '/finanzas/facturacion', icon: HeartPulse, label: 'Facturación / Convenios' },
      { to: '/finanzas/cierre-caja', icon: Calculator, label: 'Cierre de Caja' },
    ]
  },
  {
    label: 'Marketplace', icon: Store, children: [
      { to: '/marketplace/mi-tienda', icon: Store, label: 'Mi Tienda' },
      { to: '/marketplace', icon: Sparkles, label: 'Tienda Digital' },
      { to: '/marketplace/tienda-medica', icon: Package, label: 'Tienda Médica' },
      { to: '/marketplace/proveedores', icon: Truck, label: 'Proveedores' },
      { to: '/marketplace/carrito', icon: ShoppingCart, label: 'Mi Carrito' },
      { to: '/marketplace/pedidos', icon: PackageSearch, label: 'Mis Pedidos' },
      { to: '/marketplace/cotizaciones', icon: FileQuestion, label: 'Cotizaciones' },
    ]
  },
  {
    label: 'Herramientas', icon: Wrench, children: [
      { to: '/herramientas/metodos-pago', icon: CreditCard, label: 'Métodos de Pago' },
      { to: '/herramientas/rrhh', icon: Users, label: 'RRHH' },
      { to: '/herramientas/afip', icon: Landmark, label: 'AFIP' },
      { to: '/herramientas/medicina-laboral', icon: Shield, label: 'Medicina Laboral & ART' },
      { to: '/herramientas/whatsapp-ai-bot', icon: Bot, label: 'WhatsApp AI Bot' },
      { to: '/herramientas/plantillas-informe', icon: FileText, label: 'Plantillas de Informes' },
      { to: '/herramientas/ajustes-globales', icon: Settings, label: 'Ajustes Globales' },
      { to: '/herramientas/academy', icon: GraduationCap, label: 'Academy' },
    ]
  },
  { to: '/modelos', icon: LayoutTemplate, label: 'Modelos' },
  { to: '/companias', icon: Building2, label: 'Compañías', soloSuperAdmin: true },
]

// Popover flotante montado en document.body con position:fixed, usado para mostrar
// los items de un grupo (o el menu de usuario) cuando el sidebar esta colapsado y no
// hay espacio para expandir inline. Se posiciona a la derecha del boton que lo abrio.
function FlyoutPortal({ anchorRef, onClose, children, align = 'top' }) {
  const [coords, setCoords] = useState(null)
  const panelRef = useRef(null)

  useEffect(() => {
    const update = () => {
      const r = anchorRef.current?.getBoundingClientRect()
      if (!r) return
      setCoords(align === 'bottom' ? { bottom: window.innerHeight - r.bottom, left: r.right + 8 } : { top: r.top, left: r.right + 8 })
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [anchorRef, align])

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current?.contains(e.target) || anchorRef.current?.contains(e.target)) return
      onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [anchorRef, onClose])

  if (!coords) return null
  return createPortal(
    <div ref={panelRef} style={{ position: 'fixed', zIndex: 9999, ...coords }}
      className="w-56 bg-white border border-slate-100 shadow-lg rounded-xl py-1.5 overflow-hidden">
      {children}
    </div>,
    document.body
  )
}

function SidebarNav({ isGroupActive, groupOpen, setGroupOpen, onNavigate, colapsado, items }) {
  const btnRefs = useRef({})

  return (
    <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
      {(items ?? nav).map((item) => {
        if (item.children) {
          const active = isGroupActive(item.children)
          const open = groupOpen === item.label
          if (!btnRefs.current[item.label]) btnRefs.current[item.label] = { current: null }
          return (
            <div key={item.label}>
              <button ref={el => btnRefs.current[item.label].current = el}
                title={colapsado ? item.label : undefined}
                onClick={() => setGroupOpen(g => g === item.label ? null : item.label)}
                className={`w-full flex items-center gap-3 transition-colors text-sm font-medium py-2.5 rounded-xl ` +
                  (colapsado ? 'justify-center px-0' : 'px-3') + ' ' +
                  (active ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100')}>
                <item.icon size={17} className="shrink-0" />
                {!colapsado && <>
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown size={14} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                </>}
              </button>
              {open && !colapsado && (
                <div className="mt-0.5 ml-3.5 pl-3 border-l border-slate-100 space-y-0.5">
                  {item.children.map(({ to, icon: Icon, label }) => (
                    <NavLink key={to} to={to} onClick={onNavigate}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 text-sm px-3 py-2 rounded-lg transition-colors ` +
                        (isActive ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100')
                      }>
                      <Icon size={15} className="shrink-0" />
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}
              {open && colapsado && (
                <FlyoutPortal anchorRef={btnRefs.current[item.label]} onClose={() => setGroupOpen(null)}>
                  <p className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 uppercase">{item.label}</p>
                  {item.children.map(({ to, icon: Icon, label }) => (
                    <NavLink key={to} to={to} onClick={() => { onNavigate(); setGroupOpen(null) }}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors ` +
                        (isActive ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-600 hover:bg-slate-50')
                      }>
                      <Icon size={15} className="shrink-0" />
                      {label}
                    </NavLink>
                  ))}
                </FlyoutPortal>
              )}
            </div>
          )
        }
        return (
          <NavLink key={item.to} to={item.to} onClick={onNavigate} title={colapsado ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 text-sm font-medium py-2.5 rounded-xl transition-colors ` +
              (colapsado ? 'justify-center px-0' : 'px-3') + ' ' +
              (isActive ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100')
            }>
            <item.icon size={17} className="shrink-0" />
            {!colapsado && item.label}
          </NavLink>
        )
      })}
    </nav>
  )
}

function PerfilMenu({ colapsado, onNavigate }) {
  const [userMenu, setUserMenu] = useState(false)
  const [langMenu, setLangMenu] = useState(false)
  const [estado, setEstado] = useState(() => localStorage.getItem('estado_presencia') || 'disponible')
  const btnRef = useRef(null)
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
  const cambiarEstado = (nuevo) => { setEstado(nuevo); localStorage.setItem('estado_presencia', nuevo) }
  const cerrar = () => { setUserMenu(false); onNavigate?.() }

  const menuContenido = (
    <>
      <button onClick={() => { navigate('/perfil'); cerrar() }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left">
        <div className="relative w-10 h-10 bg-indigo-500 flex items-center justify-center shrink-0 rounded-full">
          <span className="text-white font-bold text-xs">{initiales}</span>
        </div>
        <div className="min-w-0">
          <p className="text-slate-800 text-sm font-medium truncate">{session?.nombre}</p>
          <p className="text-slate-400 text-xs">Ir al perfil</p>
        </div>
      </button>

      <div className="h-px bg-slate-100 my-1 mx-3" />

      <button onClick={() => cambiarEstado('disponible')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
        <CheckCircle2 size={18} className="text-green-500 shrink-0" />
        <span className="flex-1 text-left">Disponible</span>
        {estado === 'disponible' && <Check size={16} className="text-indigo-500" />}
      </button>
      <button onClick={() => cambiarEstado('ausente')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
        <Clock size={18} className="text-amber-500 shrink-0" />
        <span className="flex-1 text-left">Ausente</span>
        {estado === 'ausente' && <Check size={16} className="text-indigo-500" />}
      </button>

      <div className="h-px bg-slate-100 my-1 mx-3" />

      <div className="relative">
        <button onClick={() => setLangMenu(l => !l)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
          <Globe size={18} className="text-slate-400 shrink-0" />
          <span className="flex-1 text-left">
            Lenguaje
            <span className="block text-xs text-slate-400">ES</span>
          </span>
          <ChevronRight size={16} className="text-slate-300" />
        </button>
        {langMenu && (
          <div className="mx-4 mb-1 border border-slate-100">
            <button onClick={() => setLangMenu(false)} className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
              Español <Check size={13} className="text-indigo-500" />
            </button>
          </div>
        )}
      </div>

      <button onClick={() => { navigate('/perfil'); cerrar() }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
        <KeyRound size={18} className="text-slate-400 shrink-0" />
        Opciones de inicio de sesión
      </button>

      <button onClick={() => { logout(); cerrar() }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
        <LogOut size={18} />
        Cerrar Sesión
      </button>
    </>
  )

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
    <>
      <button ref={btnRef} onClick={() => setUserMenu(m => !m)}
        className={`w-full flex items-center gap-2.5 p-2 hover:bg-slate-100 transition-colors rounded-xl ${colapsado ? 'justify-center' : ''}`}>
        <div className="relative w-9 h-9 bg-indigo-500 flex items-center justify-center shrink-0 rounded-full">
          <span className="text-white font-bold text-xs">{initiales}</span>
          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${estado === 'disponible' ? 'bg-green-500' : 'bg-amber-500'}`} />
        </div>
        {!colapsado && <>
          <div className="text-left min-w-0 flex-1">
            <p className="text-slate-800 text-sm font-medium truncate">{session?.nombre}</p>
            <p className="text-slate-400 text-xs capitalize truncate">{session?.rol}</p>
          </div>
          <ChevronDown size={14} className={`text-slate-400 transition-transform shrink-0 ${userMenu ? 'rotate-180' : ''}`} />
        </>}
      </button>

      {userMenu && colapsado && (
        <FlyoutPortal anchorRef={btnRef} onClose={() => setUserMenu(false)} align="bottom">{menuContenido}</FlyoutPortal>
      )}
      {userMenu && !colapsado && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-slate-100 overflow-hidden shadow-lg rounded-xl py-1 z-50">
          {menuContenido}
        </div>
      )}
    </>
  )
}

export default function Layout() {
  const { session } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [groupOpen, setGroupOpen] = useState(null)
  const [colapsado, setColapsado] = useState(() => localStorage.getItem('sidebar_colapsado') === '1')
  const location = useLocation()
  const enBandeja = location.pathname.startsWith('/bandeja')
  const navItems = nav.filter(item => !item.soloSuperAdmin || session?.esSuperAdmin)

  useEffect(() => {
    if (enBandeja) setColapsado(true)
    else setColapsado(localStorage.getItem('sidebar_colapsado') === '1')
  }, [enBandeja])

  const isGroupActive = (children) => children.some(c => location.pathname.startsWith(c.to))

  const toggleColapsado = () => {
    setColapsado(c => {
      localStorage.setItem('sidebar_colapsado', c ? '0' : '1')
      return !c
    })
    setGroupOpen(null)
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar flotante — desktop */}
      <aside className={`hidden lg:flex flex-col shrink-0 m-3 mr-0 bg-white shadow-lg rounded-[28px] overflow-hidden transition-[width] duration-200 ${colapsado ? 'w-[76px]' : 'w-64'}`}>
        <div className={`border-b border-slate-100 shrink-0 flex items-center ${colapsado ? 'flex-col gap-2 py-3' : 'justify-between p-4'}`}>
          {!colapsado && <img src="/logo-clinica.png" alt="MedAdvance OS" className="h-9 w-auto object-contain" />}
          <button onClick={toggleColapsado} title={colapsado ? 'Expandir menú' : 'Comprimir menú'}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors rounded-md shrink-0">
            {colapsado ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>
        <SidebarNav items={navItems} isGroupActive={isGroupActive} groupOpen={groupOpen} setGroupOpen={setGroupOpen} onNavigate={() => {}} colapsado={colapsado} />
        <div className="p-3 border-t border-slate-100 shrink-0 relative">
          <PerfilMenu colapsado={colapsado} />
        </div>
      </aside>

      {/* Sidebar — móvil (drawer deslizante) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 max-w-[80vw] bg-white flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <img src="/logo-clinica.png" alt="MedAdvance OS" className="h-9 w-auto object-contain" />
              <button onClick={() => setMobileOpen(false)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md">
                <X size={20} />
              </button>
            </div>
            <SidebarNav items={navItems} isGroupActive={isGroupActive} groupOpen={groupOpen} setGroupOpen={setGroupOpen} onNavigate={() => setMobileOpen(false)} colapsado={false} />
            <div className="p-3 border-t border-slate-100 shrink-0 relative">
              <PerfilMenu colapsado={false} onNavigate={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* Columna derecha: topbar liviana + contenido */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {!enBandeja && (
          <header className="shrink-0 flex items-center gap-3 px-4 lg:px-6 py-3">
            <button
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white transition-colors rounded-md"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <img src="/logo-clinica.png" alt="MedAdvance OS" className="lg:hidden h-8 w-auto object-contain" />

            <div className="flex-1" />

            <button title="Notificaciones" className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white transition-colors rounded-md">
              <Bell size={18} />
            </button>
            <button title="Ayuda" className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white transition-colors rounded-md">
              <HelpCircle size={18} />
            </button>
          </header>
        )}

        <main className={enBandeja ? 'flex-1 overflow-hidden p-3' : 'flex-1 overflow-auto px-4 lg:px-6 pb-6'}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
