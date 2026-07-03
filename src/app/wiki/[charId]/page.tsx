import NotFound from '@/app/not-found';
import { db } from '@/db';
import { getCurrentUser } from '@/utils/auth';
import { personagens, comments, users } from '@/db/schema';
import SkillCard from '@/components/SkillCard';
import CharacterCard from '@/components/CharacterCard';
import ApexScaleChart from '@/components/ApexScaleChart';
import CommentsSection from '@/components/CommentsSection';

import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import parse from 'html-react-parser';

// Componente para exibir as informações do personagem selecionado na wiki
export default async function CharacterView({ params }: { params: Promise<{ charId: string }> }) {
  const resolvedParams = await params;
  const charId = resolvedParams.charId

  const p = await db.select().from(personagens).where(eq(personagens.id, charId)).then(res => res[0]);

  if (!p) return <NotFound />

  // Verifica se está logado
  const user = await getCurrentUser();
  const isLoggedIn = !!user;

  // Obtém comentários com dados do autor
  const charComments = await db.select({
    id: comments.id,
    content: comments.content,
    createdAt: comments.createdAt,
    author: {
      username: users.username,
      avatar: users.avatar
    }
  }).from(comments)
    .innerJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.personagemId, charId))
    .orderBy(desc(comments.createdAt));

  const stats = (p.stats || {}) as any;
  const skills = (Array.isArray(p.skills) ? p.skills : []) as { name: string, description: string }[];

  return (
    <>
      <div className="text-[11px] font-bold text-[#666] mb-[10px]">
        <Link href="/" className="hover:underline text-brand-link">Início</Link> &raquo;{' '}
        <Link href="/wiki" className="hover:underline text-brand-link">Wiki</Link> &raquo;{' '}
        {p.nome}
      </div>

      <div className="flex gap-[15px] items-start relative">
        <CharacterCard personagem={p} />

        <div className="flex-1 bg-white border border-panel-border p-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">

          <h2 className="text-[20px] font-serif font-bold text-[#111] m-0 mb-[15px] border-b border-[#ddd] pb-[5px]">
            Biografia
          </h2>

          <div className="text-[13px] text-[#333] leading-[1.7] mb-8">
            {parse(p.descricao || 'Nenhuma biografia fornecida.')}
          </div>

          {skills.length > 0 && (
            <div className="mb-8">
              <div className="bg-[#1f3765] text-[#ffcc00] font-bold py-[4px] px-[10px] text-[13px] mb-4 border border-[#1f3765] rounded-sm">
                Skills
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {skills.map((s, i) => (
                  <SkillCard key={i} skill={s} />
                ))}
              </div>
            </div>
          )}

          {Object.keys(stats).length > 0 && (
            <ApexScaleChart stats={stats} />
          )}

          <CommentsSection
            personagemId={charId}
            isLoggedIn={isLoggedIn}
            comments={charComments}
          />

        </div>
      </div>
    </>
  );
}
