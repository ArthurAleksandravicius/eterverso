import { db } from '@/db';
import { threads, posts, users, categories } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import Link from 'next/link';
import Button from '@/components/Button';
import UserCard from '@/components/UserCard';
import PostContent from '@/components/PostContent';

// Componente para renderizar tópicos
export default async function ThreadView({ params }: { params: Promise<{ threadId: string }> }) {
  const resolvedParams = await params;
  const threadId = resolvedParams.threadId

  const thread = await db.select().from(threads).where(eq(threads.id, threadId)).then(res => res[0]);
  if (!thread) return <p>Tópico não encontrado.</p>;

  const category = await db.select().from(categories).where(eq(categories.id, thread.categoryId)).then(res => res[0]);
  const threadPosts = await db.select().from(posts).where(eq(posts.threadId, threadId)).orderBy(asc(posts.id));
  const allUsers = await db.select().from(users);

  return (
    <>
      <div className="text-[11px] font-bold text-[#666] mb-[10px]">
        <Link href="/" className="hover:underline">Início</Link> &raquo;{' '}
        <Link href={`/cat/${category.id}`} className="hover:underline">{category.name}</Link> &raquo;{' '}
        {thread.title}
      </div>

      <div className="flex justify-between items-center mb-[15px] border-b border-[#ccc] pb-[10px]">
        <h2 className="text-[18px] text-[#222] m-0">
          <span className="bg-[#555] text-white px-2 py-1 text-[10px] rounded uppercase mr-2">{thread.tag || 'ooc'}</span>
          {thread.title}
        </h2>
      </div>

      <div className="flex flex-col gap-[2px]">
        {threadPosts.map(post => {
          const author = allUsers.find(u => u.id === post.authorId);

          return (
            <div key={post.id} className="flex border border-[#ccc] mb-[10px] bg-panel-bg shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <UserCard author={author} />
              <PostContent post={post} />
            </div>
          );
        })}
      </div>

      <div className="mt-[20px] bg-[#f9f9f9] border border-[#ccc] p-[15px]">
        <h3 className="text-[14px] mb-[10px] text-[#444]">Responder ao Tópico</h3>
        <textarea className="w-full h-[150px] border border-[#ccc] p-2 text-[13px]" placeholder="Sua resposta..."></textarea>
        <Button>
          Enviar Resposta
        </Button>
      </div>
    </>
  );
}
