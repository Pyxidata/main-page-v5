import { cn } from "../../../util/cn";
import styles from '../../css/thickScrollbar.module.css';

export default function EditTextArea({
    value = "",
    onBlur = () => {},
    onChange = () => {},
    className = "", 
    style = {}
}: {
    value: string,
    onBlur: () => void,
    onChange: (value: string) => void,
    className?: string,
    style?: React.CSSProperties
}) {

    const defaultStyle = `bg-transparent pl-1 focus:outline-none border border-teal-500 w-full ${styles['thick-scrollbar']}`;

    return (
        <textarea 
            value={value} 
            onBlur={onBlur}
            onChange={(e) => {onChange(e.target.value)}}
            className={cn(defaultStyle, className, "text-teal-500")} 
            style={style} 
        />
    )
}