import parse from 'html-react-parser';

type Props = {
    post: {
        id: string;
        threadId: string;
        authorId: string;
        content: string;
        edited: boolean;
        createdAt: string;
        updatedAt: string;
    }
}

export default function PostContent({ post }: Props) {
    return (
        <div className="flex-1 p-[15px] text-[13px] leading-[1.6] text-[#333] relative">
            <div className="text-[10px] text-[#888] border-b border-dashed border-[#ccc] pb-[5px] mb-[10px]">
                Postado em: {post.createdAt} {post.edited && <em>(Editado)</em>}
            </div>
            <div>{parse(post.content)}</div>
        </div>
    )
}