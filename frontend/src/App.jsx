import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Pacientes from './pages/Pacientes'
import Citas from './pages/Citas'
import Procedimientos from './pages/Procedimientos'
import Flujos from './pages/Flujos'
import FlujoEditor from './pages/FlujoEditor'
import Automatizaciones from './pages/Automatizaciones'
import Pagos from './pages/Pagos'
import BandejaEntrada from './pages/BandejaEntrada'
import Campanhas from './pages/Campanhas'
import Transmision from './pages/Transmision'
import Configuracion from './pages/Configuracion'
import Modelos from './pages/Modelos'
import Companias from './pages/Companias'
import Perfil from './pages/Perfil'
import PacientesMedicos from './pages/clinica/Pacientes'
import Turnos from './pages/clinica/Turnos'
import Medicos from './pages/clinica/Medicos'
import Horarios from './pages/clinica/Horarios'
import SalaEspera from './pages/clinica/SalaEspera'
import MonitorTv from './pages/clinica/MonitorTv'
import Consultas from './pages/clinica/Consultas'
import Departamentos from './pages/clinica/Departamentos'
import InformesImagenes from './pages/clinica/InformesImagenes'
import Psiquiatria from './pages/clinica/Psiquiatria'
import PsiquiatriaPaciente from './pages/clinica/PsiquiatriaPaciente'
import Psicologia from './pages/clinica/Psicologia'
import Facturacion from './pages/finanzas/Facturacion'
import CierreCaja from './pages/finanzas/CierreCaja'
import PsicologiaPaciente from './pages/clinica/PsicologiaPaciente'
import MiTienda from './pages/marketplace/MiTienda'
import TiendaDigital from './pages/marketplace/TiendaDigital'
import TiendaMedica from './pages/marketplace/TiendaMedica'
import Proveedores from './pages/marketplace/Proveedores'
import Carrito from './pages/marketplace/Carrito'
import Pedidos from './pages/marketplace/Pedidos'
import Cotizaciones from './pages/marketplace/Cotizaciones'
import MetodosPago from './pages/herramientas/MetodosPago'
import RRHH from './pages/herramientas/RRHH'
import Afip from './pages/herramientas/Afip'
import MedicinaLaboral from './pages/herramientas/MedicinaLaboral'
import WhatsappAiBot from './pages/herramientas/WhatsappAiBot'
import PlantillasInforme from './pages/herramientas/PlantillasInforme'
import AjustesGlobales from './pages/herramientas/AjustesGlobales'
import Academy from './pages/herramientas/Academy'
import AcademyArticulo from './pages/herramientas/AcademyArticulo'
import AcademyNueva from './pages/herramientas/AcademyNueva'

function PrivateRoute({ children }) {
  const { isAuth } = useAuth()
  return isAuth ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { isAuth } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={isAuth ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/flujos/:id" element={<PrivateRoute><FlujoEditor /></PrivateRoute>} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pacientes" element={<Pacientes />} />
        <Route path="citas" element={<Citas />} />
        <Route path="procedimientos" element={<Procedimientos />} />
        <Route path="campanhas" element={<Campanhas />} />
        <Route path="transmision" element={<Transmision />} />
        <Route path="bandeja" element={<BandejaEntrada />} />
        <Route path="automatizaciones" element={<Automatizaciones />} />
        <Route path="flujos" element={<Flujos />} />
        <Route path="pagos" element={<Pagos />} />
        <Route path="clinica/pacientes" element={<PacientesMedicos />} />
        <Route path="clinica/turnos" element={<Turnos />} />
        <Route path="clinica/medicos" element={<Medicos />} />
        <Route path="clinica/horarios" element={<Horarios />} />
        <Route path="clinica/sala-espera" element={<SalaEspera />} />
        <Route path="clinica/monitor" element={<MonitorTv />} />
        <Route path="clinica/consultas" element={<Consultas />} />
        <Route path="clinica/departamentos" element={<Departamentos />} />
        <Route path="clinica/informes-imagenes" element={<InformesImagenes />} />
        <Route path="clinica/psiquiatria" element={<Psiquiatria />} />
        <Route path="clinica/psiquiatria/:id" element={<PsiquiatriaPaciente />} />
        <Route path="clinica/psicologia" element={<Psicologia />} />
        <Route path="clinica/psicologia/:id" element={<PsicologiaPaciente />} />
        <Route path="finanzas/facturacion" element={<Facturacion />} />
        <Route path="finanzas/cierre-caja" element={<CierreCaja />} />
        <Route path="marketplace/mi-tienda" element={<MiTienda />} />
        <Route path="marketplace" element={<TiendaDigital />} />
        <Route path="marketplace/tienda-medica" element={<TiendaMedica />} />
        <Route path="marketplace/proveedores" element={<Proveedores />} />
        <Route path="marketplace/carrito" element={<Carrito />} />
        <Route path="marketplace/pedidos" element={<Pedidos />} />
        <Route path="marketplace/cotizaciones" element={<Cotizaciones />} />
        <Route path="herramientas/metodos-pago" element={<MetodosPago />} />
        <Route path="herramientas/rrhh" element={<RRHH />} />
        <Route path="herramientas/afip" element={<Afip />} />
        <Route path="herramientas/medicina-laboral" element={<MedicinaLaboral />} />
        <Route path="herramientas/whatsapp-ai-bot" element={<WhatsappAiBot />} />
        <Route path="herramientas/plantillas-informe" element={<PlantillasInforme />} />
        <Route path="herramientas/ajustes-globales" element={<AjustesGlobales />} />
        <Route path="herramientas/academy" element={<Academy />} />
        <Route path="herramientas/academy/nueva" element={<AcademyNueva />} />
        <Route path="herramientas/academy/:slug" element={<AcademyArticulo />} />
        <Route path="configuracion" element={<Configuracion />} />
        <Route path="modelos" element={<Modelos />} />
        <Route path="companias" element={<Companias />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
