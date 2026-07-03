'use client'

import { login } from "@/actions/authActionts";

import { useActionState, useEffect, useRef, useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

const initialState = {
    error: null as string | null,
}
// Componente da página de login
export default function Login() {
    const [state, formAction, pending] = useActionState(login, initialState)
    const [captchaToken, setCaptchaToken] = useState("")
    const captcha = useRef<HCaptcha>(null)

    useEffect(() => {
        if (!pending && state.error && captcha.current)
            captcha.current.resetCaptcha()
    }, [pending, state.error])

    return (
        <div className="max-w-md mx-auto">
            <h2>Entrar</h2>

            {/*Mensagem de erro, caso haja*/}
            {
                state.error && (
                    <div className="bg-[#f8d7da] text-[#721c24] p-3 mb-4 border border-[#f5c6cb] rounded text-sm">
                        {state.error}
                    </div>
                )
            }

            {/* Formulário que chama a action de login*/}
            <form action={formAction} className="flex flex-col gap-4">
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
                    required />

                <input type="hidden" name="captchaToken" value={captchaToken} />

                <HCaptcha
                    ref={captcha}
                    sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                    onVerify={(token) => { setCaptchaToken(token) }} />

                <button disabled={pending} type="submit" className="bg-btn-primary text-white py-2 font-bold disabled:opacity-50">
                    {pending ? "Entrando..." : "Login"}
                </button>


            </form>
        </div>
    )
}