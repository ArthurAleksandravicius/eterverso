'use client'

import { signup } from "@/actions/authActionts";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useActionState, useEffect, useRef, useState } from "react";

const initialState = {
    error: null as string | null
}

export default function Signup() {
    const [state, formAction, pending] = useActionState(signup, initialState)
    const [captchaToken, setCaptchaToken] = useState("")
    const captcha = useRef<HCaptcha>(null)

    useEffect(() => {
        if (!pending && state.error && captcha.current)
            captcha.current.resetCaptcha()
    }, [pending, state.error])

    return (
        <div className="max-w-md mx-auto">
            <h2>Cadastrar-se</h2>

            {/*Mensagem de erro, caso haja*/}
            {
                state.error && (
                    <div className="bg-[#f8d7da] text-[#721c24] p-3 mb-4 border border-[#f5c6cb] rounded text-sm">
                        {state.error}
                    </div>
                )
            }

            {/* Formulário para a ação de cadastrar usuário */}
            <form action={formAction} className="flex flex-col gap-4">
                <input
                    type="text"
                    name="username"
                    placeholder="Nome de usuário"
                    className="border p-2"
                    minLength={3}
                    maxLength={12}
                    required />
                <input
                    type="email"
                    name="email"
                    placeholder="elon.musk@email.com"
                    className="border p-2"
                    required />

                <input
                    type="password"
                    name="password"
                    placeholder="Senha"
                    className="border p-2"
                    minLength={8}
                    required />

                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirmar Senha"
                    className="border p-2"
                    minLength={8}
                    required />

                <input type="hidden" name="captchaToken" value={captchaToken} />

                <HCaptcha
                    ref={captcha}
                    sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                    onVerify={(token) => { setCaptchaToken(token) }} />


                <button disabled={pending} type="submit" className="bg-btn-primary text-white py-2 font-bold disabled:opacity-50">
                    {pending ? "Cadastrando..." : "Cadastrar-se"}
                </button>
            </form>
        </div>
    )
}