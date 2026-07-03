import z from "zod";
import { db } from "@/db";
import { comments } from "@/db/schema";

// Schema para validar os dados do comentário
const createCommentSchema = z.object({
    personagemId: z.uuid("Personagem inválido."),
    authorId: z.uuid("Autor inválido."),
    content: z.string().trim().min(5, 'O conteúdo deve ter pelo menos 5 caractere.'),
})

type CreateCommentInput = z.infer<typeof createCommentSchema>

// Insere comentário no banco de dados
export async function createComment(data: CreateCommentInput): Promise<{ error: string } | { data: typeof comments.$inferSelect }> {
    const parsed = createCommentSchema.safeParse(data)

    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message || "Dados inválidos." }
    }

    const [newComment] = await db.insert(comments).values(parsed.data).returning()

    return { data: newComment }
}