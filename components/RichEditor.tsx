import React, { useCallback, useState } from "react";
import { BaseEditor, Descendant, createEditor, Transforms, Text } from "slate";
import {
  Slate,
  Editable,
  withReact,
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
} from "slate-react";

import styles from "../styles/RichEditor.module.css";

type ParagraphElement = {
  type: "paragraph";
  children: CustomText[];
  editable?: boolean;
};

type CustomText = { text: string; editable?: boolean; bold?: boolean };

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: ParagraphElement;
    Text: CustomText;
  }
}

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "Personal Details", bold: true, editable: false }],
  },
  {
    type: "paragraph",
    children: [
      { text: "My first name is " },
      { text: "ahmed", editable: false },
    ],
  },
  {
    type: "paragraph",
    children: [{ text: "My second name is " }, { text: "", editable: false }],
  },
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

export const RichEditor = () => {
  const [editor] = useState(() => withReact(createEditor()));

  const renderElement = useCallback(
    ({ attributes, children, element }: RenderElementProps) => {
      return (
        <p contentEditable={element.editable} {...attributes}>
          {children}
        </p>
      );
    },
    []
  );

  const renderLeaf = useCallback(
    ({ attributes, children, leaf }: RenderLeafProps) => {
      if (leaf.bold) {
        children = <strong>{children}</strong>;
      }

      return (
        <span contentEditable={leaf.editable} {...attributes}>
          {children}
        </span>
      );
    },
    []
  );

  return (
    <Slate
      editor={editor}
      value={initialValue}
      onChange={(value) => {
        console.log(value);
      }}
    >
      <div className={styles.container}>
        <Editable
          className={styles.editorArea}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
        />

        <div className={styles.inputArea}>
          <input
            type="text"
            className={styles.field}
            onChange={(e) => {
              try {
                Transforms.removeNodes(editor, {
                  at: [1, 1],
                  match: (n) => Text.isText(n) && !n.editable,
                });
              } catch {}

              Transforms.insertNodes(
                editor,
                { text: e.target.value, editable: false },
                { at: [1, 1] }
              );
            }}
          />
          <input
            type="text"
            className={styles.field}
            onChange={(e) => {
              try {
                Transforms.removeNodes(editor, {
                  at: [2, 1],
                  match: (n) => Text.isText(n) && !n.editable,
                });
              } catch {}

              Transforms.insertNodes(
                editor,
                { text: e.target.value, editable: false },
                { at: [2, 1] }
              );
            }}
          />
        </div>
      </div>
    </Slate>
  );
};
