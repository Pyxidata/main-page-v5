import { cn } from "../../../util/cn";

export default function Button({
  type = "button",
  className = "",
  text,
  onClick,
  disabled = false,
} : {
  type?: "button" | "submit" | "reset",
  className?: string,
  text: string,
  onClick?: () => void,
  disabled?: boolean,
}) {

  return (
    <button
      type={type}
      className={cn(
        "border border-white/50 px-2 py-1 bg-white/10 hover:bg-white/20 transition-colors",
        disabled && "bg-white/5 hover:bg-white/5 text-white/40",
        className,
      )}
      onClick={onClick}
      disabled={disabled}  
    >
      {text}
    </button>
  );
}