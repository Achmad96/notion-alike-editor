import { EditorBubble } from 'novel';
import { Fragment, type ReactNode } from 'react';
import { Editor } from '@tiptap/react';

interface GenerativeMenuSwitchProps {
  editor: Editor;
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const GenerativeMenuSwitch = ({ editor, children, open, onOpenChange }: GenerativeMenuSwitchProps) => {
  return (
    <EditorBubble
      tippyOptions={{
        placement: open ? 'bottom-start' : 'top',
        onHidden: () => {
          onOpenChange(false);
          editor.chain().unsetHighlight().run();
        }
      }}
      className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-muted bg-background shadow-xl">
      {!open && <Fragment>{children}</Fragment>}
    </EditorBubble>
  );
};

export default GenerativeMenuSwitch;
