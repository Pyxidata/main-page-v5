import React from "react";

interface LineBreakTextProps {
  text: string;
}

function LineBreakText(props: LineBreakTextProps) {
  const renderTextWithBreaks = () => {
    if (!props.text) {
      return null;
    }

    const parts = props.text.split('\n');

    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {index < parts.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return <>{renderTextWithBreaks()}</>;
}

export default LineBreakText;