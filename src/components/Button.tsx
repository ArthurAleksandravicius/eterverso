type Props = React.ButtonHTMLAttributes<HTMLButtonElement>

export default function Button(props: Props) {
    return (
        <button {...props} className="bg-btn-primary text-white px-2 py-1 text-[11px] font-bold border border-panel-border rounded-sm cursor-pointer hover:opacity-80 transition-opacity duration-200">
            {props.children}
        </button>
    )
}