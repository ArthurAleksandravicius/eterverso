
type Props = {
    author: {
        id: string;
        email: string;
        username: string;
        avatar: string | null;
        title: string | null;
        bio: string | null;
        postsCount: number;
        admTentativaUsada: boolean;
        role: string;
        isStaff: boolean;
        joinDate: string;
        createdAt: string;
        updatedAt: string;
    } | undefined
}

export default function UserCard({ author }: Props) {
    return (
        <div className="w-[180px] bg-[#f4f4f4] border-r border-[#ccc] p-[10px] text-center text-[11px] shrink-0">
            <strong className="text-brand-link text-[14px]">{author?.username || 'Desconhecido'}</strong>
            <div className="my-[5px] text-[#666] text-[10px] uppercase">{author?.title}</div>
            {author?.avatar ? (
                <img src={author.avatar} alt="Avatar" className="w-[150px] max-w-full border border-[#999] p-[2px] bg-white mt-[5px]" />
            ) : (
                // colocar aqui foto default
                <div className="w-[100px] h-[100px] bg-[#e0e0e0] border border-[#ccc] mx-auto mt-[5px] flex items-center justify-center text-[#aaa]">Sem Avatar</div>
            )}
            <div className="mt-[10px] text-[10px] text-[#555]">
                Posts: {author?.postsCount || 0}<br />
                Registrado: {author?.joinDate}
            </div>
        </div>
    )
}