import parse, { Element, type HTMLReactParserOptions } from 'html-react-parser';

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

// Tags que nunca devem chegar ao DOM a partir de conteúdo de usuário
const BLOCKED_TAGS = new Set(['script', 'style', 'iframe', 'frame', 'object', 'embed', 'form', 'link', 'meta', 'base']);
const URL_ATTRS = new Set(['href', 'src', 'xlink:href', 'action', 'formaction', 'poster']);

const isUnsafeUrl = (value: string) => {
    const url = value.trim().toLowerCase();
    return url.startsWith('javascript:')
        || url.startsWith('vbscript:')
        || (url.startsWith('data:') && !url.startsWith('data:image/'));
}

// Remove tags perigosas, atributos de evento (on*) e URLs com esquemas executáveis
const sanitizeOptions: HTMLReactParserOptions = {
    replace(node) {
        if (!(node instanceof Element)) return;
        if (BLOCKED_TAGS.has(node.name.toLowerCase())) return <></>;
        for (const attr of Object.keys(node.attribs)) {
            const name = attr.toLowerCase();
            if (name.startsWith('on') || (URL_ATTRS.has(name) && isUnsafeUrl(node.attribs[attr]))) {
                delete node.attribs[attr];
            }
        }
    }
}

export default function PostContent({ post }: Props) {
    return (
        <div className="flex-1 p-[15px] text-[13px] leading-[1.6] text-[#333] relative">
            <div className="text-[10px] text-[#888] border-b border-dashed border-[#ccc] pb-[5px] mb-[10px]">
                Postado em: {post.createdAt} {post.edited && <em>(Editado)</em>}
            </div>
            <div>{parse(post.content, sanitizeOptions)}</div>
        </div>
    )
}
