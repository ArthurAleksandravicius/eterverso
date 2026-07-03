import "../app/style.css"

type Props = {
    skill: {
        nome: string;
        descricao: string;
    }
}

export default function SkillCard({ skill }: Props) {
    return (
        <div className="bg-white h-[200px] border border-[#e6ebf5] border-2px border-l-[#283a60] border-l-4 p-[10px] text-[10px] leading-[1.6]
                         overflow-y-scroll hover:text-white hover:bg-[#3c64a04f] transition-all
                         rounded-sm hover:rounded-lg font-semibold shadow-md">
            <h4 className="m-0 mb-[5px] text-[#283a60] uppercase tracking-wide text-[12px] font-bold">
                {skill.nome}
            </h4>
            <div className="text-[#444]">
                {skill.descricao}
            </div>
        </div>
    );
}
