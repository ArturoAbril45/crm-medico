import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Pacientes from './pages/Pacientes'
import PacienteForm from './pages/PacienteForm'
import PacienteDetalle from './pages/PacienteDetalle'
import Citas from './pages/Citas'
import Procedimientos from './pages/Procedimientos'
import Flujos from './pages/Flujos'
import FlujoConstructor from './pages/FlujoConstructor'
import Automatizaciones from './pages/Automatizaciones'
import Pagos from './pages/Pagos'
import BandejaEntrada from './pages/BandejaEntrada'
import Campanhas from './pages/Campanhas'
import Transmision from './pages/Transmision'
import Configuracion from './pages/Configuracion'
import Modelos from './pages/Modelos'
import Perfil from './pages/Perfil'
import Medicos from './pages/Medicos'
import Departamentos from './pages/Departamentos'
import Horarios from './pages/Horarios'
import Consultas from './pages/Consultas'
import ConectarWhatsapp from './pages/ConectarWhatsapp'
import Roles from './pages/Roles'
import ModuloGenerico from './pages/ModuloGenerico'
import { flatRoutes } from './navConfig'

function PrivateRoute({ children }) {
  const { isAuth } = useAuth()
  return isAuth ? children : <Navigate to="/login" replace />
}

// Rutas con página real y modelo de datos propio ya construidos.
const rutasExistentes = new Set([
  'dashboard', 'pacientes', 'citas', 'procedimientos', 'campanhas', 'transmision',
  'bandeja', 'automatizaciones', 'flujos', 'pagos', 'configuracion', 'modelos', 'perfil',
  'clinica/medicos', 'clinica/departamentos', 'clinica/horarios', 'clinica/consultas',
  'whatsapp/conectar', 'roles',
])

// Todo módulo del menú que todavía no tiene un modelo de datos propio se conecta
// igual a persistencia real (crear/listar/editar/eliminar) vía la tabla genérica
// `modulo_registros`, filtrada por su slug — ningún módulo queda "en construcción".
const rutasGenericas = flatRoutes.filter(item => item.to && !rutasExistentes.has(item.to.slice(1)))
const slugModulo = (to) => to.slice(1).replace(/\//g, '-')

function AppRoutes() {
  const { isAuth } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={isAuth ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pacientes" element={<Pacientes />} />
        <Route path="pacientes/nuevo" element={<PacienteForm />} />
        <Route path="pacientes/:id/editar" element={<PacienteForm />} />
        <Route path="pacientes/:id" element={<PacienteDetalle />} />
        <Route path="citas" element={<Citas />} />
        <Route path="procedimientos" element={<Procedimientos />} />
        <Route path="campanhas" element={<Campanhas />} />
        <Route path="transmision" element={<Transmision />} />
        <Route path="bandeja" element={<BandejaEntrada />} />
        <Route path="automatizaciones" element={<Automatizaciones />} />
        <Route path="flujos" element={<Flujos />} />
        <Route path="flujos/:id/constructor" element={<FlujoConstructor />} />
        <Route path="pagos" element={<Pagos />} />
        <Route path="configuracion" element={<Configuracion />} />
        <Route path="modelos" element={<Modelos />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="clinica/medicos" element={<Medicos />} />
        <Route path="clinica/departamentos" element={<Departamentos />} />
        <Route path="clinica/horarios" element={<Horarios />} />
        <Route path="clinica/consultas" element={<Consultas />} />
        <Route path="whatsapp/conectar" element={<ConectarWhatsapp />} />
        <Route path="roles" element={<Roles />} />

        {rutasGenericas.map(item => (
          <Route
            key={item.to}
            path={item.to.slice(1)}
            element={<ModuloGenerico modulo={slugModulo(item.to)} label={item.label} icon={item.icon} />}
          />
        ))}
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
