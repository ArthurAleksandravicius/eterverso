type Props = {
    skill: {
        name: string;
        description: string;
    }
}

export default function SkillCard({ skill }: Props) {
    return (
        <div className="bg-white border border-[#283a60] p-[10px] text-[11px] leading-[1.6]">
            <h4 className="m-0 mb-[5px] text-[#283a60] uppercase tracking-wide text-[12px] font-bold">
                {skill.name}
            </h4>
            <div className="text-[#444]">
                {skill.description}
            </div>
        </div>
    );
}
