import { useEffect, useState } from "react";
import { cn } from "../../../util/cn";
import Text from "../texts/Text";
import EditTextField from "../inputs/EditTextField";
import { ref, update } from "firebase/database";
import { database } from "../../../firebase-config";
import { useUserStore } from "../../stores/userStore";
import EditTextArea from "../inputs/EditTextArea";
import { TextStyle } from "../../styles/TextStyle";

export default function EditableText({
    defaultText = "", 
    className = "", 
    style = {},
    useTextArea = false,
    path = "",
    field = "",
    label = "",
    animate,
    animationDelay,
    animationDuration,
    animationCharSet,
}: {
    defaultText: string,
    className?: string,
    style?: React.CSSProperties,
    useTextArea?: boolean,
    path: string,
    field: string,
    label: string,
    animate?: boolean;
    animationDelay?: number;
    animationDuration?: number;
    animationCharSet?: string;
}) {

    const [text, setText] = useState<string>("");
    const { isEditMode } = useUserStore();

    const updateDb = () => {
        update(ref(database, path), { [field] : text })
    };

    useEffect(() => {
        setText(defaultText);
    }, [defaultText])

    return (
        isEditMode ? (
            <div className="flex flex-col w-full">
                <Text
                    className={cn(TextStyle.Label, "text-teal-500")}
                    text={label}/>
                    
                {useTextArea ?

                    <EditTextArea
                        value={text} 
                        onBlur={updateDb}
                        onChange={(newText) => {setText(newText)}}
                        className={className} 
                        style={style}/>

                :

                    <EditTextField 
                        value={text} 
                        onBlur={updateDb}
                        onChange={(newText) => {setText(newText)}}
                        className={className} 
                        style={style}/>
                }
            </div>
        ) : (

            <Text
                className={className} 
                style={style}
                text={text}
                animate={animate}
                animationDelay={animationDelay}
                animationDuration={animationDuration}
                animationCharSet={animationCharSet}
            />
        )
    )
}