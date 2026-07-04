"use server";

import { createComment } from "@/data/comments";
import { getCurrentUser } from "@/utils/auth";
import { revalidatePath } from "next/cache";

export type CommentActionState = {
    success: boolean;
    error?: string;
}

export async function postComment(_prevState: CommentActionState, formData: FormData): Promise<CommentActionState> {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return { success: false, error: "Você precisa estar logado para comentar." };
        }

        const personagemId = formData.get("personagemId") as string;
        const content = formData.get("content") as string;

        if (!personagemId || !content || content.trim() === "") {
            return { success: false, error: "Conteúdo inválido." };
        }

        const result = await createComment({
            personagemId,
            authorId: user.id,
            content: content.trim()
        })

        if ("error" in result) {
            return { success: false, error: result.error };
        }

        revalidatePath(`/wiki/${personagemId}`);
        return { success: true };
    } catch (e) {
        console.log(e);

        return { success: false, error: "Ocorreu um erro ao enviar o comentário. Tente novamente." };
    }
}
