'use server'

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

/*
    Validação para o campo de senha.
    deve conter pelo menos uma letra minúscula,
    uma maiúscula, um número e um caracter especial
 */
const isPasswordValid = (password: string) => {
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);
    return hasLowercase && hasUppercase && hasNumber && hasSpecial;
}

// 3 a 20 caracteres, somente letras, números, ponto, traço e underline
const isUsernameValid = (username: string) => /^[a-zA-Z0-9_.-]{3,20}$/.test(username);

// Action para logar
export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const captchaToken = formData.get('captchaToken') as string

    if (!email || !password) {
        return { error: "Email e senha são obrigatórios." }
    }

    if (!isPasswordValid(password)) {
        return { error: "A senha deve conter ao menos uma letra minúscula, uma letra maiúscula, um número e um caractere especial." }
    }

    if (!captchaToken) {
        return { error: "Por favor, complete o captcha." }
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: { captchaToken }
    })

    if (error) {
        return { error: "Credenciais inválidas." }
    }

    redirect('/')
}

// Action para registrar user no banco de dados
export async function signup(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const username = formData.get('username') as string
    const captchaToken = formData.get('captchaToken') as string

    // Verifica se os campos foram preenchidos
    if (!email || !password || !confirmPassword || !username) {
        return { error: "Todos os campos são obrigatórios." }
    }

    if (!isUsernameValid(username)) {
        return { error: "O nome de usuário deve ter entre 3 e 20 caracteres, usando apenas letras, números, ponto, hífen ou underline." }
    }

    if (password !== confirmPassword) {
        return { error: "As senhas não coincidem." }
    }

    if (!isPasswordValid(password)) {
        return { error: "A senha deve conter ao menos uma letra minúscula, uma letra maiúscula, um número e um caractere especial." }
    }

    if (!captchaToken) {
        return { error: "Por favor, complete o captcha." }
    }

    // Verifica se username já existe
    const { data: userExists } = await supabase.from('users').select('username').eq('username', username).single()
    if (userExists) {
        return { error: "Nome de usuário já cadastrado." }
    }

    // Verifica se email já está em uso
    const { data: emailExists } = await supabase.from('users').select('email').eq('email', email).single()
    if (emailExists) {
        return { error: "Email já cadastrado." }
    }

    const { error } = await supabase.auth.signUp({
        email, password,
        options: {
            data: { username },
            captchaToken
        }
    })

    if (error) {
        return { error: error.message }
    }

    redirect('/')
}

// Action para fazer logout
export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
}