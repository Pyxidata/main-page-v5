import { useEffect, useState } from "react";
import { cn } from "../../../util/cn";
import Text from "../texts/Text";
import EditTextField from "../inputs/EditTextField";
import { ref, update } from "firebase/database";
import { database } from "../../../firebase-config";
import { useUserStore } from "../../stores/userStore";
import { TextStyle } from "../../styles/TextStyle";
import EditTextArea from "../inputs/EditTextArea";

export default function EditableField({
    defaultValue = "",
    path = "",
    field = "",
    label = "",
    useTextArea = false,
    type = "",
}: {
    defaultValue: string,
    path: string,
    field: string,
    label: string,
    useTextArea?: boolean,
    type?: string,
}) {

    const [value, setValue] = useState<string>("");
    const { isEditMode } = useUserStore();
    const updateDb = () => {
        update(ref(database, path), { [field] : value })
    };

    useEffect(() => {
        setValue(defaultValue);
    }, [defaultValue])

    return (
        isEditMode && (
            <div className="flex flex-col w-full">
                <Text
                    className={cn(TextStyle.Label, "text-teal-500")}
                    text={label}/>
                    
                {useTextArea ?
                
                    <EditTextArea
                        value={value} 
                        onBlur={updateDb}
                        onChange={(newValue) => {setValue(newValue)}}/>

                :

                    <EditTextField 
                        type={type}
                        value={value} 
                        onBlur={updateDb}
                        onChange={(newValue) => {setValue(newValue)}}/>
                }
            </div>
        )
    )
}