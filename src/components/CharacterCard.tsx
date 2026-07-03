import Link from "next/link";

type Props = {
    personagem: {
        id: string;
        authorId: string
        nome: string;
        titulo: string | null;
        raca: string | null;
        faccao: string | null;
        status: string | null;
        imagem: string | null;
        apexTier: string | null;
        mascaraTier: string | null;
        stats: any;
    }
}

// Componente de card de personagem
export default function CharacterCard({ personagem: p }: Props) {
    const statusColor = p.status === 'Vivo' || p.status === 'Viva' ? '#007700' : (p.status === 'Afastada' || p.status === 'Afastado' ? '#774400' : '#770000');
    // Calcula o Wa do personagem, que indica sua versatilidade
    // Calculado através do desvio padrão das stats
    const calculateWa = (stats: any) => {
        if (!stats || Object.keys(stats).length === 0) return null;

        const statKeys = Object.keys(stats);
        const values = statKeys.map(k => {
            const val = stats[k] || stats[k.toLowerCase()] || 0;
            return Math.max(0, Math.min(100, Number(val)));
        });

        const sum = values.reduce((a, b) => a + b, 0);
        if (sum === 0) return null;

        const avg = sum / 8;
        const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / 8;
        const sd = Math.sqrt(variance);

        let waValue = 1 - (sd / 50);
        waValue = Math.max(0, Math.min(1, waValue));

        return waValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const wa = calculateWa(p.stats);

    return (
        <div className="w-[250px] shrink-0 sticky top-4 self-start bg-[#f1f0e4] border-2 border-[#1f3765] rounded-sm shadow-md overflow-hidden font-sans">
            <Link href={`/wiki/${p.id}`}>
                <div className="bg-[#1f3765] text-[#ffcc00] font-bold text-center py-2 text-[14px] border-b border-[#1f3765]">
                    {p.nome}
                </div>
                <div className="p-[10px] bg-white border-b border-[#1f3765] flex justify-center">
                    {p.imagem ? (
                        <img src={p.imagem} alt={p.nome} className="max-w-full h-auto border border-[#ccc]" />
                    ) : (
                        <div className="w-[200px] h-[300px] bg-[#ddd] flex items-center justify-center text-[48px] text-white">
                            {p.nome.substring(0, 1)}
                        </div>
                    )}
                </div>
            </Link>

            <div className="p-[12px] text-[12px] text-[#333] leading-[1.6] bg-[#fdfdfc]">
                <div className="grid grid-cols-[60px_1fr] gap-x-2">
                    <span className="font-bold text-[#111]">Título:</span>
                    <span>{p.titulo || 'Nenhum'}</span>

                    <span className="font-bold text-[#111]">Raça:</span>
                    <span>{p.raca || 'Desconhecida'}</span>

                    <span className="font-bold text-[#111]">Facção:</span>
                    <span>{p.faccao || 'Nenhuma'}</span>

                    <span className="font-bold text-[#111]">Status:</span>
                    <span className="font-bold" style={{ color: statusColor }}>{p.status || 'Desconhecido'}</span>
                </div>

                <div className="mt-4 flex flex-col gap-[5px]">
                    {p.apexTier && (
                        <div className="bg-[#e6ebf5] border border-[#aab7d3] text-center py-[2px] font-bold text-topbar-start">
                            Apex Scale: {p.apexTier}
                        </div>
                    )}
                    {wa && (
                        <div className="bg-[#e6f5e6] border border-[#a3d3a3] text-center py-[2px] font-bold text-[#2d7a2d]">
                            Wa: {wa}
                        </div>
                    )}
                    {p.mascaraTier && (
                        <div className="bg-[#f5e6e6] border border-[#d3a3a3] text-center py-[2px] font-bold text-[#9a3a3a]">
                            Máscara: {p.mascaraTier}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}