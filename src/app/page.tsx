import CategoryItem from '@/components/CategoryItem';
import { db } from '@/db';
import { categories, threads, posts, users } from '@/db/schema';
import { sql } from 'drizzle-orm';
import './index.css'

export default async function ForumHome() {
  const allCategories = await db.select().from(categories).orderBy(categories.id);
  const allThreads = await db.select().from(threads);
  const allPosts = await db.select().from(posts);

  const totalUsersResult = await db.select({ count: sql<number>`count(*)` }).from(users);
  const totalUsers = totalUsersResult[0].count;

  return (
    <div>
      <div className="text-[11px] font-bold text-[#667] mb-[10px]">
        Início &raquo; Fórum
      </div>

      {/* Criar item para cada categoria */}
      {allCategories.map((cat) => <CategoryItem key={cat.id} cat={cat} />)}

      {/* Estatísticas */}
      <div className="bg-[--color-btn-primary] border border-[#ccc] p-[8px] text-[11px] flex gap-[15px] mt-[20px]">
        <span><b>{allPosts.length}</b> posts</span>
        <span><b>{allThreads.length}</b> tópicos</span>
        <span><b>{totalUsers}</b> usuários</span>
      </div>
    </div>
  );
}
