import { getMarkedType } from '@/lib/utils';
import { Extension } from '@tiptap/core';
import { EditorState } from '@tiptap/pm/state';
import { Plugin, PluginKey } from 'prosemirror-state';

const ColorPlugin = Extension.create({
  name: 'ColorPlugin',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('ColorPlugin'),
        props: {
          handleKeyDown(view, event) {
            const { state, dispatch } = view;
            const { selection, tr } = state;
            const { from, to, $from } = selection;

            let markType = 'user';
            markType = getMarkedType(state, from);
            const colorMark = state.schema.marks.textStyle.create({ type: markType });

            if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
              try {
                tr.insertText(event.key, from, to);
                const newTo = tr.mapping.map(to);
                tr.addMark(from, newTo, colorMark);
                dispatch(tr);
                return true;
              } catch (err) {
                console.log('error', err);
                return false;
              }
            }

            if (!(event.key === 'Backspace' || event.key === 'Delete' || (event.key === 'Backspace' && event.ctrlKey))) {
              return false;
            }

            if (event.ctrlKey && event.key === 'Backspace') {
              const previousWordStart = findPreviousWordStart(state, from);
              if (previousWordStart !== null) {
                tr.removeMark(previousWordStart, from);
                tr.addMark(previousWordStart, from, colorMark);
                tr.delete(previousWordStart, from);
                dispatch(tr);
                return true;
              }
            }

            if (from !== to) {
              tr.removeMark(from, to);
              tr.addMark(from, to, colorMark);
              tr.delete(from, to);
              dispatch(tr);
              return true;
            }

            if (event.key === 'Backspace' && from > 0) {
              if ($from.parentOffset === 0) {
                // Cursor is at the start of a block, merge with the previous block
                const previousBlockEnd = from - 1;
                const previousBlock = state.doc.resolve(previousBlockEnd).nodeBefore;
                if (previousBlock && previousBlock.isTextblock) {
                  const currentBlockStart = $from.start();
                  tr.delete(previousBlockEnd - 1, currentBlockStart);
                  dispatch(tr);
                  return true;
                }
              }
              tr.removeMark(from - 1, from);
              tr.addMark(from - 1, from, colorMark);
              tr.delete(from - 1, from);
              dispatch(tr);
              return true;
            }

            if (event.key === 'Delete') {
              const $to = state.doc.resolve(to);
              if ($to.nodeAfter && $to.nodeAfter.isTextblock && to === $to.end()) {
                const nextNodeStart = to + 1;
                const nextNode = state.doc.nodeAt(nextNodeStart);
                if (nextNode) {
                  const nextNodeSize = nextNode.nodeSize;
                  tr.delete(to, nextNodeStart + nextNodeSize - 1);
                  dispatch(tr);
                  return true;
                }
              }
              tr.removeMark(to, to + 1);
              tr.addMark(to, to + 1, colorMark);
              tr.delete(to, to + 1);
              dispatch(tr);
              return true;
            }
          }
        }
      })
    ];
  }
});

const findPreviousWordStart = (state: EditorState, pos: number) => {
  const { doc } = state;
  const text = doc.textBetween(0, pos, ' ', ' ');
  const match = /(\S+)\s*$/.exec(text);
  return match ? pos - match[0].length : null;
};

export default ColorPlugin;
