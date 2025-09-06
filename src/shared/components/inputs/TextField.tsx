import { cn } from "../../../util/cn";


export default function TextField({
  type = "text",
  value = "",
  placeholder = "",
  onBlur = () => {},
  onChange = () => {},
  className = "", 
  style = {},
  name = "",
  required = false,
  autoValue = false,
} : {
  type?: string,
  value?: string,
  placeholder?: string,
  onBlur?: () => void,
  onChange?: (value: string) => void,
  className?: string,
  style?: React.CSSProperties,
  name?: string,
  required?: boolean,
  autoValue?: boolean,
}) {

  const defaultStyle = "p-4 w-full border border-white/50 focus:outline-none bg-transparent hover:bg-white/5 transition-colors"

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={autoValue ? undefined : value}
      onChange={(e) => {onChange(e.target.value)}}
      className={cn(defaultStyle, className)}
      style={style}
      onBlur={onBlur}
      name={name}
      required={required}
    />
  );
}