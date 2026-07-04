"use client";

import React, { useRef, useActionState, useEffect } from 'react';
import { postComment, type CommentActionState } from '@/actions/commentActions';
import Button from './Button';
import { toast } from 'sonner';

type Props = {
    personagemId: string;
    isLoggedIn: boolean;
    comments: {
        id: string;
        content: string;
        createdAt: string;
        author: {
            username: string;
            avatar: string | null;
        }
    }[];
};

const initialState: CommentActionState = { success: false };

export default function CommentsSection({ personagemId, isLoggedIn, comments }: Props) {
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction, isPending] = useActionState(postComment, initialState);

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset();
            toast.success("Comentário adicionado com sucesso!");
        } else if (state.error) {
            toast.error(state.error);
        }
    }, [state]);

    return (
        <div className="w-full mt-6 border border-[#aab7d3] bg-[#f0f4f8] rounded-sm">
            <div className="bg-[#1f3765] text-[#ffcc00] font-bold py-[4px] px-[10px] text-[13px]">
                Comentários ({comments.length})
            </div>

            <div className="p-4">
                {comments.length > 0 ? (
                    <div className="flex flex-col gap-4 mb-6">
                        {comments.map(c => (
                            <div key={c.id} className="flex gap-3 bg-white border border-[#ccc] p-3 rounded-sm shadow-sm">
                                <div className="w-[40px] h-[40px] shrink-0 bg-[#ddd] border border-[#999] rounded-sm overflow-hidden flex items-center justify-center text-[#555] font-bold">
                                    {c.author.avatar ? (
                                        <img src={c.author.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        c.author.username.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1 text-[12px] leading-[1.6]">
                                    <div className="font-bold text-[#1f3765] mb-1">
                                        {c.author.username} <span className="text-[#888] font-normal text-[10px] ml-2">{new Date(c.createdAt).toLocaleString('pt-BR')}</span>
                                    </div>
                                    <div className="text-[#333]">
                                        {c.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-[#666] text-[12px] italic mb-6">Nenhum comentário ainda.</div>
                )}


                {/* Exibe o form de comentário se o user tiver logado */}
                {isLoggedIn ? (
                    <form
                        ref={formRef}
                        action={formAction}
                        className="bg-white p-3 border border-[#ccc]"
                    >
                        <input type="hidden" name="personagemId" value={personagemId} />
                        <h4 className="text-[13px] font-bold text-[#333] m-0 mb-2">Adicionar um comentário</h4>

                        <textarea
                            name="content"
                            required
                            className="w-full border border-[#ccc] p-2 text-[12px] h-[80px] resize-y mb-2 focus:outline-none focus:border-[#1f3765]"
                            placeholder="Escreva seu comentário..."
                        ></textarea>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Enviando...' : 'Enviar Comentário'}
                        </Button>
                    </form>
                ) : (
                    <div className="bg-[#fff3cd] border border-[#ffeeba] text-[#856404] p-3 text-[12px] rounded-sm">
                        Faça login para comentar
                    </div>
                )}
            </div>
        </div>
    );
}
