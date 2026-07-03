import { db } from "@/db";
import { categories, threads, posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

type Props = {
    cat: {
        id: string;
        name: string;
        description: string | null;
    }
}

// Componente que representa uma categoria no fórum, exibido na home page
export default async function CategoryItem(props: Props) {
    const { cat } = props;
    const catThreads = (await db.select().from(threads).where(eq(threads.categoryId, cat.id)));
    const catPosts = (await db.select().from(posts).where(eq(posts.threadId, cat.id)));
    const lastThread = catThreads[catThreads.length - 1];

    return (
        <>
            <div key={cat.id} className="mb-5 rounded-sm border border-panel-border overflow-hidden bg-white shadow-sm flex flex-row min-h-[64px]">

                <div className="flex-1 p-[12px] flex items-center gap-[15px] border-r border-panel-border">
                    <div className="w-[38px] h-[38px] rounded-full bg-table-header-bg border border-panel-border flex items-center justify-center shrink-0">
                        {/* Ícone da categoria */}
                        <svg className="w-[20px] h-[20px] fill-[#5c7bb0]" viewBox="0 0 24 24">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <Link href={`/cat/${cat.id}`} className="font-bold text-[14px] text-brand-link hover:underline block mb-[2px]">{cat.name}</Link>
                        <div className="text-[#666] text-[11px]">{cat.description}</div>
                    </div>
                </div>

                <div className="w-[120px] p-[10px] border-r border-panel-border flex flex-col justify-center items-center text-[11px] bg-[#f9f9f9] shrink-0">
                    <span className="text-[#444] mb-[2px]"><strong>{catThreads.length}</strong> tópicos</span>
                    <span className="text-[#444]"><strong>{catPosts.length}</strong> posts</span>
                </div>

                {/* Último post da categoria */}
                <div className="w-[240px] p-[10px] flex flex-col justify-center text-[11px] shrink-0 bg-[#f9f9f9]">
                    {lastThread ? (
                        <>
                            <div className="text-[#666] mb-[2px]">Último post:</div>
                            <Link href={`/thread/${lastThread.id}`} className="font-bold text-brand-link hover:underline truncate w-[220px] inline-block" title={lastThread.title}>
                                {lastThread.title}
                            </Link>
                            <div className="text-[#888] text-[10px] mt-[2px]">{new Date(lastThread.createdAt).toISOString().split('T')[0]}</div>
                        </>
                    ) : (
                        <div className="text-[#888] italic h-full flex items-center">Nenhum post</div>
                    )}
                </div>
            </div>
        </>
    )
}