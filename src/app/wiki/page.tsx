import Button from '@/components/Button';
import CharacterCard from '@/components/CharacterCard';
import { db } from '@/db';
import { personagens } from '@/db/schema';

export default async function WikiHome() {
  const allPersonagens = await db.select().from(personagens).orderBy(personagens.id);

  return (
    <div>
      <div className="text-[11px] font-bold text-[#666] mb-[10px]">
        Início &raquo; Wiki
      </div>

      <div className="bg-cat-header-bg border border-cat-header-border p-[5px] font-bold text-[#333] flex justify-between items-center mb-[10px]">
        <span>Personagens Aprovados</span>
        <Button>+ Novo Personagem</Button>
      </div>

      <div className="flex flex-wrap gap-[15px]">
        {allPersonagens.map(p => (
          <CharacterCard key={p.id} personagem={p} />
        ))}
        {allPersonagens.length === 0 && (
          <p className="p-[10px] text-[#666]">Nenhum personagem registrado.</p>
        )}
      </div>
    </div>
  );
}
