'use client'

import { createContext, useContext } from "react"

const UserContext = createContext<any>(null)

// Provider para utilizar contexto do usuário logado, para componentes que
// precisam de informação do usuário 
export function UserProvider({ user, children }: { user: any, children: React.ReactNode }) {
    return (
        <UserContext.Provider value={user}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext)