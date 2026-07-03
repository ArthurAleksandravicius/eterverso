import Button from '@/components/Button';
import ThreadItem from '@/components/ThreadItem';
import ThreadSortUI from '@/components/ThreadSortUI';
import { db } from '@/db';
import { categories, threads, users, posts } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';

// Componente para exibir as categorias na home do fórum
export default async function CategoryView({ params, searchParams }: { params: Promise<{ catId: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const catId = resolvedParams.catId;
  const sort = (resolvedSearchParams.sort as string) || 'lastPost';
  const dir = (resolvedSearchParams.dir as string) || 'desc';

  const category = await db.select().from(categories).where(eq(categories.id, catId)).then(res => res[0]);

  if (!category) {
    return <p>Categoria não encontrada.</p>;
  }

  const catThreads = await db.select().from(threads).where(eq(threads.categoryId, catId));
  const allPosts = await db.select().from(posts);

  // Organiza as threads, considerando as que estão fixadas
  const threadStats = catThreads.map(thread => {
    const threadPosts = allPosts.filter(p => p.threadId === thread.id);
    const replies = Math.max(0, threadPosts.length - 1);
    const lastPostDate = threadPosts.length > 0 ? threadPosts[threadPosts.length - 1].createdAt : thread.createdAt;
    return { ...thread, replies, lastPostDate };
  });

  const sortedThreads = threadStats.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    let valA: any = a.id;
    let valB: any = b.id;

    if (sort === 'createdAt') {
      valA = new Date(a.createdAt).getTime();
      valB = new Date(b.createdAt).getTime();
    } else if (sort === 'lastPost') {
      valA = new Date(a.lastPostDate).getTime();
      valB = new Date(b.lastPostDate).getTime();
    } else if (sort === 'replies') {
      valA = a.replies;
      valB = b.replies;
    } else if (sort === 'views') {
      valA = a.views;
      valB = b.views;
    }

    if (valA < valB) return dir === 'asc' ? -1 : 1;
    if (valA > valB) return dir === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div>
      <div className="text-[11px] font-bold text-[#666] mb-[10px]">
        <Link href="/" className="hover:underline">Início</Link> &raquo; Fórum &raquo; {category.name}
      </div>

      {/* <div className="bg-cat-header-bg border border-cat-header-border p-[5px] font-bold text-[#333] flex justify-between items-center -mb-px">
        <span>{category.name}</span>
        <ButtonCreate>+ Novo Tópico</ButtonCreate>
      </div> */}

      <ThreadSortUI />

      <table className="w-full border-collapse border border-panel-border bg-white text-[12px]">
        <thead>
          <tr className="bg-table-header-bg text-left border-b border-panel-border">
            <th className="w-[50%] p-[5px] border-r border-panel-border text-[#333]">Tópico</th>
            <th className="p-[5px] border-r border-panel-border text-[#333] text-center">Autor</th>
            <th className="p-[5px] border-r border-panel-border text-[#333] text-center">Respostas</th>
            <th className="p-[5px] border-r border-panel-border text-[#333] text-center">Views</th>
          </tr>
        </thead>
        <tbody>
          {/* Renderiza os tópicos na categoria */}
          {sortedThreads.map(thread => {
            return (
              <ThreadItem key={thread.id} thread={thread} />
            );
          })}
          {/* Exibe que nao há tópicos, caso nao haja */}
          {sortedThreads.length === 0 && (
            <tr>
              <td colSpan={4} className="p-[8px] text-center text-[#888]">Nenhum tópico nesta categoria.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
