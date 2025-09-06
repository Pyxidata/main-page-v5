import React from "react";

export function emailToId(str: string) {
  const lastAtIndex = str.lastIndexOf('@');
  if (lastAtIndex !== -1) {
    return str.substring(0, lastAtIndex); 
  } else {
    return str;
  }
}

export function renderWithLineBreaks(str: string): JSX.Element {
  const lines = str.split('\n');
  return (
    <p>
      {lines.map((line, index) => (
        <React.Fragment key={index}>
          {line}
          <br />
        </React.Fragment>
      ))}
    </p>
  );
}

export function stringToTags(tagString: string): string[] {
  if (!tagString) {
    return [];
  }
  return tagString
    .split(' ')
    .map(word => word.trim())
    .filter(word => word.startsWith('#') && word.length > 1)
    .map(tag => tag.substring(1));
}

export function tagsToString(tags: string[]): string {
  if (!tags || tags.length === 0) {
    return '';
  }
  return tags
    .map(tag => `#${tag.trim()}`)
    .join(' ');
}