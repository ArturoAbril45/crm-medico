import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Pacientes from './pages/Pacientes'
import Citas from './pages/Citas'
import Procedimientos from './pages/Procedimientos'
import Flujos from './pages/Flujos'
import Automatizaciones from './pages/Automatizaciones'
import Pagos from './pages/Pagos'
import BandejaEntrada from './pages/BandejaEntrada'
import Campanhas from './pages/Campanhas'
import Transmision from './pages/Transmision'
import Configuracion from './pages/Configuracion'
import Modelos from './pages/Modelos'
import Perfil from './pages/Perfil'

function PrivateRoute({ children }) {
  const { isAuth } = useAuth()
  return isAuth ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { isAuth } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={isAuth ? <Navigate to="/dashboard" replace /> : <Login />} />
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
        <Route path="configuracion" element={<Configuracion />} />
        <Route path="modelos" element={<Modelos />} />
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
