"use server";

import { db } from "@/db";
import { comments } from "@/db/schema";
import { getCurrentUser } from "@/utils/auth";
import { revalidatePath } from "next/cache";

export async function postComment(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("Você precisa estar logado para comentar.");
    }

    const personagemId = formData.get("personagemId") as string;
    const content = formData.get("content") as string;

    if (!personagemId || !content || content.trim() === "") {
        throw new Error("Conteúdo do comentário inválido.");
    }

    await db.insert(comments).values({
        personagemId,
        authorId: user.id,
        content: content.trim()
    });

    revalidatePath(`/wiki/${personagemId}`);
}
