import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { api, getStoredAuth, storeAuth } from './api'
import type { TokenResponse } from '../types/api'

interface AuthState {
  auth: TokenResponse | null
  isAdmin: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<TokenResponse | null>(() => getStoredAuth())

  const login = useCallback(async (username: string, password: string) => {
    const res = await api.login(username, password)
    storeAuth(res)
    setAuth(res)
  }, [])

  const logout = useCallback(() => {
    storeAuth(null)
    setAuth(null)
  }, [])

  const value = useMemo(
    () => ({ auth, isAdmin: auth?.role === 'ADMIN', login, logout }),
    [auth, login, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
