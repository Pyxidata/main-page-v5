import { cn } from "../../../util/cn";

export default function EditTextField({
    value = "",
    onBlur = () => {},
    onChange = () => {},
    className = "", 
    style = {},
    type = "text",
}: {
    value: string,
    onBlur: () => void,
    onChange: (value: string) => void,
    className?: string,
    style?: React.CSSProperties,
    type?: string,
}) {

    const defaultStyle = "bg-transparent pl-1 focus:outline-none border border-teal-500 w-full";

    return (
        <input 
            value={value} 
            onBlur={onBlur}
            onChange={(e) => {onChange(e.target.value)}}
            className={cn(defaultStyle, className, "text-teal-500")} 
            style={style} 
            type={type}
        />
    )
}