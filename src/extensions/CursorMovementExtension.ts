import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

const PreventCursorMovementPlugin = Extension.create({
  name: 'PreventInteractionDuringGeneration',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('PreventInteractionDuringGeneration'),
        props: {
          handleDOMEvents: {
            keydown: (view, event) => {
              if (this.options.isGenerating) {
                event.preventDefault();
              }
              return this.options.isGenerating;
            },
            mousedown: (view, event) => {
              if (this.options.isGenerating) {
                event.preventDefault();
              }
              return this.options.isGenerating;
            },
            click: (view, event) => {
              if (this.options.isGenerating) {
                event.preventDefault();
              }
              return this.options.isGenerating;
            },
            touchstart: (view, event) => {
              if (this.options.isGenerating) {
                event.preventDefault();
              }
              return this.options.isGenerating;
            }
          }
        }
      })
    ];
  },

  addOptions() {
    return {
      isGenerating: false
    };
  }
});

export default PreventCursorMovementPlugin;
