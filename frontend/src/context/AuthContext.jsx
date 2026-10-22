import { createContext, useContext, useState, useCallback } from 'react'
import { login as apiLogin, logout as apiLogout } from '../services/api'

const AuthContext = createContext(null)

function mapUser(user) {
  return {
    id: user.id, nombre: user.name, email: user.email, rol: user.rol?.nombre ?? '', permisos: user.permisos ?? [],
    esSuperAdmin: !!user.es_super_admin,
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('crm_session')) } catch { return null }
  })

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await apiLogin(email, password)
      const s = mapUser(data.user)
      localStorage.setItem('crm_token', data.token)
      localStorage.setItem('crm_session', JSON.stringify(s))
      setSession(s)
      return true
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(() => {
    apiLogout().catch(() => {})
    localStorage.removeItem('crm_token')
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
