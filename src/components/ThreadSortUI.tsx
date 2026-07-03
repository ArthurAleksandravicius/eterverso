'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function ThreadSortUI() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentSort = searchParams.get('sort') || 'lastPost';
  const currentDir = searchParams.get('dir') || 'desc';

  const updateSort = (sort: string, dir: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sort);
    params.set('dir', dir);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-[#f9f9f9] border border-panel-border p-[8px] mb-[10px] flex gap-[10px] items-center text-[12px]">
      <span className="font-bold text-[#555]">Ordenar por:</span>
      <select 
        value={currentSort} 
        onChange={(e) => updateSort(e.target.value, currentDir)}
        className="border border-[#ccc] p-[2px] text-[12px]"
      >
        <option value="lastPost">Último Post</option>
        <option value="createdAt">Data de Criação</option>
        <option value="replies">Número de Respostas</option>
        <option value="views">Visualizações</option>
      </select>

      <select 
        value={currentDir} 
        onChange={(e) => updateSort(currentSort, e.target.value)}
        className="border border-[#ccc] p-[2px] text-[12px]"
      >
        <option value="desc">Decrescente (Z-A / Mais Novos)</option>
        <option value="asc">Crescente (A-Z / Mais Antigos)</option>
      </select>
    </div>
  );
}
