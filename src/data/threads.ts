import z from "zod";
import { db } from "@/db";
import { threads } from "@/db/schema";
import { posts } from "@/db/schema";

// Schema para validar os dados da thread
const createThreadSchema = z.object({
    categoryId: z.uuid("Categoria inválida."),
    authorId: z.uuid("Autor inválido."),
    title: z.string().trim().min(5, 'O título deve ter no mínimo 5 caracteres.'),
    tag: z.string().optional(),
    content: z.string().trim().min(10, 'O conteúdo deve ter pelo menos 10 caracteres.'),
})

type CreateThreadInput = z.infer<typeof createThreadSchema>

// Função para acionar a ação de criar tópico no banco de dados
export async function createThread(data: CreateThreadInput) {
    // Insere a thread no banco de dados
    const [newThread] = await db.insert(threads).values(data).returning()

    await db.insert(posts).values({
        threadId: newThread.id,
        authorId: data.authorId,
        content: data.content,
    });

    return newThread
}