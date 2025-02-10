import TextStyle from '@tiptap/extension-text-style';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';

import PreventCursorMovementPlugin from '@/extensions/CursorMovementExtension';
import ColorPlugin from '@/extensions/ColorExtension';
import AttributePlugin from '@/extensions/AttributeExtension';

import { Color } from '@tiptap/extension-color';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { cx } from 'class-variance-authority';

const placeholder = 'Enter your ideas here...';

const starterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: {
      class: cx('list-disc list-outside leading-3 -mt-2')
    }
  },
  orderedList: {
    HTMLAttributes: {
      class: cx('list-decimal list-outside leading-3 -mt-2')
    }
  },
  listItem: {
    HTMLAttributes: {
      class: cx('leading-normal -mb-2')
    }
  },
  blockquote: {
    HTMLAttributes: {
      class: cx('border-l-4 border-primary')
    }
  },
  codeBlock: {
    HTMLAttributes: {
      class: cx('rounded-sm bg-muted border p-5 font-mono font-medium')
    }
  },
  code: {
    HTMLAttributes: {
      class: cx('rounded-md bg-muted  px-1.5 py-1 font-mono font-medium'),
      spellcheck: 'false'
    }
  },
  horizontalRule: false,
  dropcursor: {
    color: '#DBEAFE',
    width: 4
  },
  gapcursor: false,
  heading: {
    levels: [1, 2, 3, 4]
  }
});

export const EditorExtensions = [
  StarterKit,
  Markdown.configure({
    html: true,
    linkify: true,
    transformCopiedText: true,
    transformPastedText: true
  }),
  Color,
  TextStyle,
  AttributePlugin,
  ColorPlugin,
  Highlight.configure({ multicolor: true }) as Extension,
  PreventCursorMovementPlugin.configure({ isGenerating: false }),
  Placeholder.configure({ placeholder, emptyEditorClass: 'is-empty', emptyNodeClass: 'is-empty' })
];
