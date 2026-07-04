"use client"

import Button from "@/components/Button"

// Componente para exibir erro e nao quebrar o app
export default function Error(
    { error, reset }:
        { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8
                        text-center bg-panel-bg border border-panel-border rounded-sm
                        shadow-sm">
            <h2 className="text-2xl font-bold text-[#1f3765] mb-4">Algo deu errado!</h2>
            <p className="text-[#665] text-sm mb-6 max-w-md">Um erro ocorreu. Tente novamente.</p>
            <div className="bg-[#fff3cd] border border-[#ffeeba] text-[#856404] p-3 text-xs
                            rounded-sm mb-6 w-full max-w-md text-left overflow-auto">
                <code>
                    {error.message}
                </code>
            </div>
            <Button onClick={reset}>
                Tentar novamente
            </Button>
        </div>
    )
}