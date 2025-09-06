import { ReactNode, isValidElement } from 'react';

export function reactNodeToString(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return node.toString();
  }

  if (Array.isArray(node)) {
    return node.map(reactNodeToString).join('');
  }

  if (isValidElement(node)) {
    return reactNodeToString(node.props.children);
  }
  
  return '';
}