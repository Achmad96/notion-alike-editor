import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { EditorState } from '@tiptap/pm/state';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getMarkedType = (state: EditorState, pos: number) => {
  let type = 'user';
  state.doc.nodesBetween(pos, pos + 1, (node) => {
    node.marks.forEach((mark) => {
      if (mark.type.name === 'textStyle') {
        if (mark.attrs.type === 'ai' || mark.attrs.type === 'edit') {
          type = 'edit';
        }
      }
    });
  });
  return type;
};
