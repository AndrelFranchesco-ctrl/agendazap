import { useEffect, useState, useCallback } from 'react'
import { AuthContext } from './authContextBase'
import { observarUsuario } from '../services/auth'
import { buscarPerfil } from '../services/usuarios'

// usuario: undefined = verificando sessão | null = deslogado | User = logado
// perfil: undefined = carregando | null = logado sem negócio ainda | {negocioId} = tem negócio
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(undefined)
  const [perfil, setPerfil] = useState(undefined)

  const carregarPerfil = useCallback(async (uid) => {
    const p = await buscarPerfil(uid)
    setPerfil(p)
  }, [])

  useEffect(() => {
    const cancelar = observarUsuario((u) => {
      setUsuario(u)
      if (u) {
        carregarPerfil(u.uid)
      } else {
        setPerfil(null)
      }
    })
    return cancelar
  }, [carregarPerfil])

  const refreshPerfil = useCallback(() => {
    if (usuario) return carregarPerfil(usuario.uid)
  }, [usuario, carregarPerfil])

  return (
    <AuthContext.Provider value={{ usuario, perfil, refreshPerfil }}>
      {children}
    </AuthContext.Provider>
  )
}
