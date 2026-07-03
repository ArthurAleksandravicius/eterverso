import Button from '@/components/Button';
import Link from 'next/link';


export default function NotFound() {
  return (
    <div>
      <div className="text-[11px] font-bold text-[#667] mb-[10px]">
        <Link href="/" className="hover:underline text-brand-link">Início</Link> &raquo; Erro 404
      </div>

      <div className="bg-[#f9f9f9] border border-[#ccc] p-[40px] text-center mt-[20px] shadow-sm rounded-sm">
        <h2 className="text-[32px] text-[#cc3333] mb-[10px] m-0">404</h2>
        <h3 className="text-[18px] text-[#333] m-0 mb-[15px]">Página Não Encontrada</h3>
        <p className="text-[13px] text-[#666] leading-[1.6] max-w-[500px] mx-auto mb-[20px]">
          A página que você está tentando acessar não existe, foi removida ou você não tem permissão para vê-la.
        </p>
        <Link href="/">
          <Button type="button">
            Retornar ao Início
          </Button>
        </Link>
      </div>
    </div>
  );
}
