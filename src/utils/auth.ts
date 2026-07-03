import { cache } from 'react'
import { createClient } from './supabase/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

// Função para obter usuário atual logado usando cache
export const getCurrentUser = cache(async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const [dbUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1)

    return dbUser || null
})