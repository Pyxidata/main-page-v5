import { useEffect, useState } from "react";
import { cn } from "../../../util/cn";
import Text from "../texts/Text";
import EditTextField from "../inputs/EditTextField";
import { ref, update } from "firebase/database";
import { database } from "../../../firebase-config";
import { useUserStore } from "../../stores/userStore";
import { TextStyle } from "../../styles/TextStyle";

export default function EditableLink({
  defaultUrl = "",
  linkText = "",
  className = "",
  style = {},
  path = "",
  field = "",
  label = "",
}: {
  defaultUrl: string;
  linkText: string;
  className?: string;
  style?: React.CSSProperties;
  path: string;
  field: string;
  label: string;
}) {

  const [url, setUrl] = useState<string>("");
  const { isEditMode } = useUserStore();

  const updateDb = () => {
    update(ref(database, path), { [field]: url });
  };

  useEffect(() => {
    setUrl(defaultUrl);
  }, [defaultUrl]);

  return (
    isEditMode ? (
      <div className="flex flex-col">

        <Text
          className={cn(TextStyle.Label, "text-teal-500")}
          text={`${label} (URL)`}/>

        <EditTextField
          value={url}
          onBlur={updateDb}
          onChange={(newUrl) => { setUrl(newUrl); }}
          className={className}
          style={style}/>

      </div>

    ) : (
      
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(className, "text-blue-500 hover:underline")}
        style={style}>
        <Text text={linkText || url} />
      </a>
    )
  );
}