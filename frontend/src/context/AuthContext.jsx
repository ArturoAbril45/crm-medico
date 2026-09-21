import { createContext, useContext, useState, useCallback } from 'react'
import { login as loginApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('crm_session')) } catch { return null }
  })

  const login = useCallback(async (usuario, password) => {
    try {
      const { data } = await loginApi(usuario, password)
      const s = { nombre: data.nombre, rol: data.rol, user: data.usuario, permisos: data.permisos, medicoId: data.medico_id }
      localStorage.setItem('crm_session', JSON.stringify(s))
      setSession(s)
      return true
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('crm_session')
    setSession(null)
  }, [])

  return (
    <AuthContext.Provider value={{ session, login, logout, isAuth: !!session }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
