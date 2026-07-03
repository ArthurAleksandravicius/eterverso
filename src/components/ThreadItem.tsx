import { db } from "@/db";
import { posts, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

type Props = {
    thread: {
        id: string;
        categoryId: string;
        authorId: string;
        title: string;
        tag: string | null;
        pinned: boolean;
        views: number;
        createdAt: string;
    }
}

// Componente das threads 
export default async function ThreadItem({ thread }: Props) {
    const author = await db.select().from(users).where(eq(users.id, thread.authorId)).then(res => res[0])
    const threadPosts = await db.select().from(posts).where(eq(posts.threadId, thread.id)).then(res => res.length)
    const replies = Math.max(0, threadPosts - 1);

    return (
        <tr key={thread.id}>
            <td className="p-[8px] border-r border-panel-border align-middle">
                <div className="flex gap-[10px] items-center">
                    {thread.pinned && <span className="bg-[#cc3333] text-white px-1 text-[10px] rounded font-bold">FIXO</span>}
                    {thread.tag && <span className="bg-[#555] text-white px-1 text-[10px] rounded uppercase">{thread.tag}</span>}
                    <Link href={`/thread/${thread.id}`} className="font-bold text-[13px]">{thread.title}</Link>
                </div>
            </td>
            <td className="p-[8px] border-r border-panel-border text-center align-middle">{author?.username || 'Desconhecido'}</td>
            <td className="p-[8px] border-r border-panel-border text-center align-middle">{replies}</td>
            <td className="p-[8px] border-r border-panel-border text-center align-middle">{thread.views}</td>
        </tr>
    )
}