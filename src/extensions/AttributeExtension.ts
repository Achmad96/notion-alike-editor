import { Extension } from '@tiptap/core';

const CustomAttributeHandler = Extension.create({
  name: 'CustomAttributeHandler',
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          type: {
            default: 'user',
            parseHTML() {
              return [
                {
                  tag: 'span',
                  getAttrs: (node: any) => node.getAttribute('data-type')
                }
              ];
            },
            renderHTML: (attributes) => ({
              'data-type': attributes.type
            })
          }
        }
      }
    ];
  }
});
export default CustomAttributeHandler;
