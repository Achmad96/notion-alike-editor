'use client';
import { useEffect, useRef, useState } from 'react';
import { EditorCommand, EditorCommandEmpty, EditorCommandItem, EditorCommandList, EditorRoot, JSONContent } from 'novel';
import { AnyExtension, EditorContent, useEditor } from '@tiptap/react';

import { getMarkedType } from '@/lib/utils';
import { Slice } from '@tiptap/pm/model';
import { EditorView } from '@tiptap/pm/view';
import { useNovelConfig } from '@/hooks/useNovelConfig';
import { generateAIText } from '@/lib/NovelService';
import { EditorExtensions } from '@/extensions';
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
import GenerateButton from '@/components/GenerateButton';

import { slashCommand, suggestionItems } from '@/components/slash-command';

type PreviousPromptType = {
  json: JSONContent | null;
  text: string;
};
const placeholder = 'Enter your ideas here...';

const NovelEditor = () => {
  let abortControllerRef = useRef<AbortController | null>(null);

  const [novelConfig, setNovelConfig] = useNovelConfig();
  const [generatingStatus, setGeneratingStatus] = useState<'generate' | 'regenerate' | null>(null);
  const [prevPrompt, setPrevPrompt] = useState<PreviousPromptType>({ json: null, text: '' });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
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
      Placeholder.configure({ placeholder, emptyEditorClass: 'is-empty', emptyNodeClass: 'is-empty' }),
      slashCommand
    ],
    editorProps: {
      attributes: { class: 'editor-content text-white h-auto min-h-dvh w-full max-w-full ss-font focus:border-none focus:outline-none text-lg p-3 overflow-y-auto' },
      handlePaste: (view: EditorView, event: ClipboardEvent, slice: Slice) => {
        const plainText = slice.content.textBetween(0, slice.content.size, '\n');
        const { state, dispatch } = view;
        const { selection, schema, tr } = state;
        const { from, to } = selection;
        if (!plainText) {
          return false;
        }
        let markType = getMarkedType(state, from);
        const colorMark = schema.marks.textStyle.create({ type: markType });
        // Split text and filter out empty lines
        const lines = plainText.split('\n').filter((line) => line.trim() !== '');
        const paragraphs = lines.map((line) => schema.nodes.paragraph.create({}, [schema.text(line, [colorMark])]));
        // Remove existing selection content safely
        tr.delete(from, to);
        let insertPos = tr.selection.anchor; // Use anchor for safer position calculation
        // Insert each paragraph as a separate node
        paragraphs.forEach((paragraph) => {
          tr.insert(insertPos, paragraph);
          insertPos += paragraph.nodeSize; // Update position after inserting
        });
        dispatch(tr);
        return true;
      }
    },
    onUpdate({ editor }) {
      const plainTextContent = editor.getText({ blockSeparator: '\n' });
      setNovelConfig((prev) => ({ ...prev, prompt: plainTextContent }));
    }
  });

  useEffect(() => {
    if (!editor) return;
    preventInteractionExtension.options.isGenerating = generatingStatus === 'generate';
    editor.view.updateState(editor.view.state);
  }, [editor, generatingStatus]);

  const handleGenerate = async (isRegenerate: boolean = false) => {
    if (generatingStatus || !editor) return;
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const json = editor.getJSON();
    const text = editor.getText({ blockSeparator: '\n' });
    setPrevPrompt({ json, text });

    const handleToken = (token: string) => {
      if (!token) return;
      if (token.startsWith('\n')) {
        editor.chain().focus().insertContent('</p><p>').run();
      }
      if (token.endsWith('\n')) {
        editor
          .chain()
          .focus()
          .insertContentAt(editor.state.selection.from, {
            marks: [{ type: 'textStyle', attrs: { type: 'ai' } }],
            type: 'text',
            text: token.slice(0, -1)
          })
          .insertContent('</p><p>')
          .run();
        return;
      }
      editor
        .chain()
        .focus()
        .insertContentAt(editor.state.selection.from, {
          marks: [{ type: 'textStyle', attrs: { type: 'ai' } }],
          type: 'text',
          text: token
        })
        .run();
    };

    try {
      await generateAIText(
        abortController,
        isRegenerate ? { ...novelConfig, prompt: prevPrompt.text } : novelConfig,
        () => {
          setGeneratingStatus(isRegenerate ? 'regenerate' : 'generate');
        },
        handleToken,
        () => {
          setGeneratingStatus(null);
        }
      );
    } catch (error: unknown) {
      setGeneratingStatus(null);
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      console.log('Aborting request...');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setGeneratingStatus(null);
      return;
    }
    console.log('No ongoing request to cancel.');
  };

  // const handleRegenerate = async () => {
  //   if (!editor || generatingStatus) return;
  //   editor.commands.setContent(prevPrompt.json);
  //   const prompt = prevPrompt.text;
  //   setNovelConfig({ ...novelConfig, prompt });
  //   await handleGenerate(true);
  // };

  if (!editor) {
    return <></>;
  }
  const preventInteractionExtension = editor.extensionManager.extensions.find((extension) => extension.name === 'PreventInteractionDuringGeneration') as AnyExtension;

  return (
    <>
      <div className="h-auto min-h-dvh w-[50%] max-w-[50%] bg-[#191919] rounded-md">
        <EditorRoot>
          <EditorContent editor={editor}>
            <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
              <EditorCommandEmpty className="px-2 text-white">No results</EditorCommandEmpty>
              <EditorCommandList>
                {suggestionItems.map((item: any) => {
                  return (
                    <EditorCommandItem key={item.title} value={item.title} onCommand={(editor: any) => item.command(editor)} className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">{item.icon}</div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </EditorCommandItem>
                  );
                })}
              </EditorCommandList>
            </EditorCommand>
          </EditorContent>
        </EditorRoot>
      </div>
      <div className="flex items-center gap-7">
        <GenerateButton generatingStatus={generatingStatus} handleGenerate={handleGenerate} handleCancel={handleCancel}>
          {!generatingStatus || generatingStatus === 'regenerate' ? 'Generate' : 'Cancel'}
        </GenerateButton>
      </div>
    </>
  );
};

export default NovelEditor;
