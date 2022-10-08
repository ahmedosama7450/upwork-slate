import React, { useCallback, useState } from "react";
import {
  BaseEditor,
  Editor,
  Descendant,
  createEditor,
  Transforms,
  Text,
  Element,
  Range,
  Node,
} from "slate";
import {
  Slate,
  Editable,
  withReact,
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
} from "slate-react";
import { nanoid } from "nanoid";

import { withFields } from "../utils/withFields";

import styles from "../styles/RichEditor.module.css";

type ParagraphElement = {
  type: "paragraph";
  children: CustomText[];
};

type FieldElement = {
  type: "field";
  id: string;
  content: string;
  children: CustomText[];
};

type CustomText = { text: string };

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: ParagraphElement | FieldElement;
    Text: CustomText;
  }
}

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "Personal Details" }],
  },
  {
    type: "paragraph",
    children: [{ text: "My first name is ahmed" }],
  },
  {
    type: "paragraph",
    children: [{ text: "My second name is osama " }],
  },
  {
    type: "paragraph",
    children: [{ text: "I live in Egypt" }],
  },
];

export const RichEditor = () => {
  const [editor] = useState(() => withFields(withReact(createEditor())));

  const [fieldsIds, setFieldsIds] = useState<string[]>([]);

  const renderElement = useCallback(
    ({ attributes, children, element }: RenderElementProps) => {
      switch (element.type) {
        case "field":
          return (
            <span
              {...attributes}
              contentEditable={false}
              style={{ fontWeight: "bold", backgroundColor: "yellow" }}
            >
              {children}
              {element.content}
            </span>
          );
        default:
          return <p {...attributes}>{children}</p>;
      }
    },
    []
  );

  const renderLeaf = useCallback(
    ({ attributes, children, leaf }: RenderLeafProps) => {
      return <span {...attributes}>{children}</span>;
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
      <button
        onClick={() => {
          if (!editor.selection || Range.isCollapsed(editor.selection)) return;

          // Check if there this is already a field
          const [match] = Editor.nodes(editor, {
            match: (n) => Element.isElement(n) && n.type === "field",
          });
          if (match) return;

          // Insert field element
          const fieldContent = Editor.string(editor, editor.selection);
          const fieldId = nanoid();

          Transforms.insertNodes(editor, {
            type: "field",
            id: fieldId,
            content: fieldContent,
            children: [{ text: "" }],
          });

          setFieldsIds((ids) => [...ids, fieldId]);
        }}
      >
        Turn into field
      </button>

      <div className={styles.container}>
        <Editable
          className={styles.editorArea}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
        />

        <div className={styles.inputArea}>
          {fieldsIds.map((fieldId) => (
            <input
              key={fieldId}
              type="text"
              className={styles.field}
              onChange={(e) => {
                Transforms.setNodes(
                  editor,
                  { content: e.target.value },
                  {
                    at: [],
                    match: (node) =>
                      Element.isElement(node) &&
                      node.type === "field" &&
                      node.id === fieldId,
                  }
                );
              }}
            />
          ))}
        </div>
      </div>
    </Slate>
  );
};
