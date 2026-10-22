import {
  LayoutDashboard, Users, Calendar, Stethoscope, GitBranch, Zap, CreditCard,
  Inbox, Megaphone, Radio, Settings, LayoutTemplate, ShoppingBag, Wrench,
  Baby, TrendingUp, Syringe, Brain, HeartHandshake, UserCog, Clock, DoorOpen,
  Tv, ClipboardList, Building2, ScanLine, Wallet, FileText, Store, Truck,
  ShoppingCart, Package, Receipt, GraduationCap, ShieldCheck, Sparkles,
  SlidersHorizontal, AlertTriangle, Network, HelpCircle, Droplet, Search,
  QrCode, Scissors, Warehouse, Dna, Bed, FlaskConical, BriefcaseMedical,
  Landmark, Smile, Eye, Boxes, FileStack, Activity, DoorClosed, Hospital,
} from 'lucide-react'

// Estructura completa del menú, calcada del sistema de referencia (Medical Care SaaS).
// Los ítems con `existing: true` ya tienen una página real conectada al backend.
// Los demás quedan como módulos "en construcción" mientras se van desarrollando.

export const navGroups = [
  { label: 'Panel de Control', to: '/dashboard', icon: LayoutDashboard, existing: true },

  {
    label: 'Clínica Médica', icon: Stethoscope, items: [
      { label: 'Pacientes', to: '/pacientes', icon: Users, existing: true },
      { label: 'Citas', to: '/citas', icon: Calendar, existing: true },
      { label: 'Procedimientos', to: '/procedimientos', icon: Stethoscope, existing: true },
      { label: 'Inicio Pediatría', to: '/clinica/pediatria', icon: Baby },
      { label: 'Curvas de Crecimiento', to: '/clinica/curvas-crecimiento', icon: TrendingUp },
      { label: 'Vacunas', to: '/clinica/vacunas', icon: Syringe },
      { label: 'Psiquiatría', to: '/clinica/psiquiatria', icon: Brain },
      { label: 'Psicología', to: '/clinica/psicologia', icon: HeartHandshake },
      { label: 'Mis Pacientes', to: '/clinica/mis-pacientes', icon: Users },
      { label: 'Médicos', to: '/clinica/medicos', icon: UserCog, existing: true },
      { label: 'Horarios', to: '/clinica/horarios', icon: Clock, existing: true },
      { label: 'Control de Sala', to: '/clinica/control-sala', icon: DoorOpen },
      { label: 'Monitor TV', to: '/clinica/monitor-tv', icon: Tv },
      { label: 'Consultas', to: '/clinica/consultas', icon: ClipboardList, existing: true },
      { label: 'Departamentos', to: '/clinica/departamentos', icon: Building2, existing: true },
      { label: 'Informes de Imágenes', to: '/clinica/informes-imagenes', icon: ScanLine },
    ],
  },

  { label: 'WhatsApp Chat', to: '/bandeja', icon: Inbox, existing: true },
  { label: 'Conectar WhatsApp', to: '/whatsapp/conectar', icon: QrCode, existing: true },

  {
    label: 'Finance', icon: Wallet, items: [
      { label: 'Pagos', to: '/pagos', icon: CreditCard, existing: true },
      { label: 'Cierre de Caja', to: '/finance/cierre-caja', icon: Wallet },
      { label: 'Facturación / Convenios', to: '/finance/facturacion-convenios', icon: FileText },
    ],
  },

  {
    label: 'Marketplace', icon: ShoppingBag, items: [
      { label: 'Mi Tienda', to: '/marketplace/mi-tienda', icon: Store },
      { label: 'Tienda Digital', to: '/marketplace/tienda-digital', icon: Store },
      { label: 'Tienda Médica', to: '/marketplace/tienda-medica', icon: Store },
      { label: 'Proveedores', to: '/marketplace/proveedores', icon: Truck },
      { label: 'Mi Carrito', to: '/marketplace/carrito', icon: ShoppingCart },
      { label: 'Mis Pedidos', to: '/marketplace/pedidos', icon: Package },
      { label: 'Cotizaciones', to: '/marketplace/cotizaciones', icon: Receipt },
    ],
  },

  {
    label: 'Herramientas', icon: Wrench, items: [
      { label: 'Campañas', to: '/campanhas', icon: Megaphone, existing: true },
      { label: 'Transmisión', to: '/transmision', icon: Radio, existing: true },
      { label: 'Automatización', to: '/automatizaciones', icon: Zap, existing: true },
      { label: 'Flujos de Conversación', to: '/flujos', icon: GitBranch, existing: true },
      { label: 'Modelos', to: '/modelos', icon: LayoutTemplate, existing: true },
      { label: 'Configuración', to: '/configuracion', icon: Settings, existing: true },
      { label: 'Roles y Usuarios', to: '/roles', icon: ShieldCheck, existing: true },
      { label: 'Academia', to: '/herramientas/academia', icon: GraduationCap },
      { label: 'AFIP', to: '/herramientas/afip', icon: Landmark },
      { label: 'Agente IA Clínica', to: '/herramientas/agente-ia', icon: Sparkles },
      { label: 'Ajustes Globales', to: '/herramientas/ajustes-globales', icon: SlidersHorizontal },
      { label: 'Alertas Farmacológicas', to: '/herramientas/alertas-farmacologicas', icon: AlertTriangle },
      { label: 'API FHIR', to: '/herramientas/api-fhir', icon: Network },
      { label: 'Ayuda', to: '/herramientas/ayuda', icon: HelpCircle },
      { label: 'Banco de Sangre', to: '/herramientas/banco-sangre', icon: Droplet },
      { label: 'Búsqueda Nacional HCE', to: '/herramientas/busqueda-hce', icon: Search },
      { label: 'Check-in QR', to: '/herramientas/checkin-qr', icon: QrCode },
      { label: 'Cirugía/Tratamiento', to: '/herramientas/cirugia-tratamiento', icon: Scissors },
      { label: 'Compras y Proveedores', to: '/herramientas/compras-proveedores', icon: Warehouse },
      { label: 'Coworking & Alquiler', to: '/herramientas/coworking', icon: Building2 },
      { label: 'Farmacia', to: '/herramientas/farmacia', icon: ShieldCheck },
      { label: 'Genómica & PGx', to: '/herramientas/genomica', icon: Dna },
      { label: 'Inteligencia Artificial', to: '/herramientas/ia', icon: Sparkles },
      { label: 'Internaciones', to: '/herramientas/internaciones', icon: Bed },
      { label: 'Laboratorios', to: '/herramientas/laboratorios', icon: FlaskConical },
      { label: 'Medicina Laboral & ART', to: '/herramientas/medicina-laboral', icon: BriefcaseMedical },
      { label: 'Métodos de Pago', to: '/herramientas/metodos-pago', icon: CreditCard },
      { label: 'Odontología', to: '/herramientas/odontologia', icon: Smile },
      { label: 'Oftalmología', to: '/herramientas/oftalmologia', icon: Eye },
      { label: 'Packs de Cirugía', to: '/herramientas/packs-cirugia', icon: Boxes },
      { label: 'Plantillas de Informes', to: '/herramientas/plantillas-informes', icon: FileStack },
      { label: 'Programas Crónicos', to: '/herramientas/programas-cronicos', icon: Activity },
      { label: 'Quirófanos', to: '/herramientas/quirofanos', icon: DoorClosed },
      { label: 'Red de Clínicas', to: '/herramientas/red-clinicas', icon: Hospital },
    ],
  },
]

// Todas las rutas hoja, en un solo array — usado por App.jsx para generar <Route> automáticamente.
export const flatRoutes = navGroups.flatMap(g => g.items ? g.items : [g])
