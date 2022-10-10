import React, { Dispatch, SetStateAction, useCallback, useState } from "react";
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
import { withEditable } from "../utils/withEditable";

import styles from "../styles/RichEditor.module.css";
import { withHistory } from "slate-history";
import { HistoryEditor } from "slate-history/dist/history-editor";

type CustomText = { text: string; editable?: boolean };

type FieldElement = {
  type: "field";
  id: string;
  content: string;
  order: number;
  children: CustomText[];
};

type ParagraphElement = {
  type: "paragraph";
  children: (CustomText | FieldElement)[];
};

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
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

export const RichEditor = ({
  isAdmin,
  setIsAdmin,
}: {
  isAdmin: boolean;
  setIsAdmin: Dispatch<SetStateAction<boolean>>;
}) => {
  const [editor] = useState(() =>
    withEditable(withFields(withReact(withHistory(createEditor()))), isAdmin)
  );

  const [fieldsIds, setFieldsIds] = useState<string[]>([]);
  const [nextFieldOrder, setNextFieldOrder] = useState(0);

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
      return (
        <span
          {...attributes}
          contentEditable={
            isAdmin ? true : leaf.editable === undefined ? false : leaf.editable
          }
          style={{ backgroundColor: leaf.editable ? "lightblue" : undefined }}
        >
          {children}
        </span>
      );
    },
    [isAdmin]
  );

  const turnIntoField = () => {
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
      order: nextFieldOrder,
      children: [{ text: "" }],
    });

    setNextFieldOrder((order) => order + 1);
    setFieldsIds((ids) => [...ids, fieldId]);
  };

  const turnIntoEditable = () => {
    if (!editor.selection || Range.isCollapsed(editor.selection)) return;

    Transforms.setNodes(
      editor,
      { editable: true },
      { match: (n) => Text.isText(n), split: true }
    );
  };

  const turnIntoReadonly = () => {
    if (!editor.selection || Range.isCollapsed(editor.selection)) return;

    Transforms.setNodes(
      editor,
      { editable: false },
      { match: (n) => Text.isText(n), split: true }
    );
  };

  return (
    <Slate
      editor={editor}
      value={initialValue}
      onChange={(value) => {
        console.log(value);

        const fieldsElements: FieldElement[] = [];

        for (const node of value) {
          if (Element.isElement(node)) {
            for (const childNode of node.children) {
              if (Element.isElement(childNode) && childNode.type === "field") {
                fieldsElements.push(childNode);
              }
            }
          }
        }

        fieldsElements.sort((a, b) => a.order - b.order);
        setFieldsIds(fieldsElements.map((field) => field.id));
      }}
    >
      {isAdmin && (
        <div>
          <button onClick={() => turnIntoField()}>Turn into field</button>
          <button onClick={() => turnIntoEditable()}>Turn into editable</button>
          <button onClick={() => turnIntoReadonly()}>Turn into readonly</button>
        </div>
      )}

      <div>
        <button onClick={() => setIsAdmin((isAdmin) => !isAdmin)}>
          {isAdmin ? "Change to End User" : "Change to Admin"}
        </button>
      </div>

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
