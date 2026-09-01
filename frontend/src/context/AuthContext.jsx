import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

const USERS = [
  { user: 'admin', password: 'clinica2024', nombre: 'Administrador', rol: 'admin' },
  { user: 'doctor', password: 'doctor123', nombre: 'Dr. Ramón Rojas', rol: 'doctor' },
]

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('crm_session')) } catch { return null }
  })

  const login = useCallback((user, password) => {
    const found = USERS.find(u => u.user === user && u.password === password)
    if (!found) return false
    const s = { nombre: found.nombre, rol: found.rol, user: found.user }
    localStorage.setItem('crm_session', JSON.stringify(s))
    setSession(s)
    return true
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
