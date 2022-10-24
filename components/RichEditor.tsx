import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BaseEditor,
  Editor,
  Descendant,
  createEditor,
  Transforms,
  Text,
  Element,
  Range,
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
import { htmlEscape } from "escape-goat";
import parse from "html-react-parser";

import { withFields } from "../utils/withFields";
import { withEditable } from "../utils/withEditable";

import styles from "../styles/RichEditor.module.css";
import { withHistory } from "slate-history";
import { HistoryEditor } from "slate-history/dist/history-editor";
import { Toolbar } from "./Toolbar";

type CustomText = { text: string; editable?: boolean };

type FieldElement = {
  type: "field";
  id: string;
  content: string;
  order: number;
  children: CustomText[];
};

export type ParagraphElement = {
  type: "paragraph";
  children: (CustomText | FieldElement)[];
  align?: "left" | "center" | "right" | "justify";
};

export type Heading1Element = {
  type: "heading1";
  children: (CustomText | FieldElement)[];
};

export type Heading2Element = {
  type: "heading2";
  children: (CustomText | FieldElement)[];
};

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element:
      | ParagraphElement
      | FieldElement
      | Heading1Element
      | Heading2Element;
    Text: CustomText;
  }
}

const isAdminState = {
  isAdmin: true,
};

type Document = {
  templateId: string;
  documentFields: {
    fieldId: string;
    fieldValue: string;
  }[];
};

export const RichEditor = ({
  initialValue,
}: {
  initialValue: Descendant[];
}) => {
  const [isAdmin, setIsAdmin] = useState(true);

  const [editor] = useState(() =>
    withEditable(
      withFields(withReact(withHistory(createEditor()))),
      isAdminState
    )
  );

  const templateIdRef = useRef<string>();

  useEffect(() => {
    isAdminState.isAdmin = isAdmin;
  }, [isAdmin]);

  const [fieldsIds, setFieldsIds] = useState<string[]>([]);
  const [nextFieldOrder, setNextFieldOrder] = useState(0);

  const [currentDocumentHtml, setCurrentDocumentHtml] = useState<string>();

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
        case "heading1":
          return <h3 {...attributes}>{children}</h3>;
        case "heading2":
          return <h4 {...attributes}>{children}</h4>;
        default:
          return (
            <p style={{ textAlign: element.align }} {...attributes}>
              {children}
            </p>
          );
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
            isAdmin ? true : leaf.editable !== undefined && leaf.editable
          }
          style={{
            backgroundColor:
              leaf.editable !== undefined && leaf.editable
                ? "lightblue"
                : undefined,
          }}
          suppressContentEditableWarning={true}
        >
          {children}
        </span>
      );
    },
    [isAdmin]
  );

  const getTemplatesIds = () => {
    const templatesIds: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith("template-")) {
        templatesIds.push(key);
      }
    }

    return templatesIds;
  };

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

  const saveTemplate = () => {
    localStorage.setItem(
      "template-" + nanoid(),
      JSON.stringify(editor.children)
    );
  };

  const saveDocument = () => {
    const documentFields: { fieldId: string; fieldValue: string }[] = [];

    for (const fieldId of fieldsIds) {
      for (const node of editor.children) {
        if (Element.isElement(node)) {
          for (const childNode of node.children) {
            if (
              Element.isElement(childNode) &&
              childNode.type === "field" &&
              childNode.id === fieldId
            ) {
              documentFields.push({
                fieldId: fieldId,
                fieldValue: childNode.content,
              });
            }
          }
        }
      }
    }

    const document: Document = {
      templateId: templateIdRef.current!,
      documentFields,
    };

    localStorage.setItem("document-" + nanoid(), JSON.stringify(document));
  };

  const getDocumentsIds = () => {
    const documentsIds: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith("document-")) {
        documentsIds.push(key);
      }
    }

    return documentsIds;
  };

  const serializeToHtml = (
    nodes: Descendant[],
    fields: Document["documentFields"]
  ): string => {
    return nodes.map((n) => serializeToHtmlHelper(n, fields)).join("");
  };

  const serializeToHtmlHelper = (
    node: Descendant,
    fields: Document["documentFields"]
  ): string => {
    if (Text.isText(node)) {
      let textHtml = htmlEscape(node.text);

      /*      if (node.code) {
        textHtml = `<code>${textHtml}</code>`;
      } else {
        if (node.bold) {
          textHtml = `<strong>${textHtml}</strong>`;
        }

        if (node.italic) {
          textHtml = `<em>${textHtml}</em>`;
        }
      }
 */
      return textHtml;
    }

    const children = node.children
      .map((n) => serializeToHtmlHelper(n, fields))
      .join("");

    switch (node.type) {
      case "field":
        return `<span style="fontWeight:bold; backgroundColor:yellow;">${
          fields.find((fieldProps) => {
            return fieldProps.fieldId === node.id;
          })?.fieldValue
        }</span>`;
      default:
        return `<p>${children}</p>`;
    }
  };

  return (
    <Slate
      editor={editor}
      value={initialValue}
      onChange={(value) => {
        console.log(value);

        // We are looking for all fields elements in slate value
        // and then put them in `fieldsElements`
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

        // We are sorting the fields elements by their order
        fieldsElements.sort((a, b) => a.order - b.order);
        setFieldsIds(fieldsElements.map((field) => field.id));

        // Saving value to localstorage
        const isAstChange = editor.operations.some(
          (op) => "set_selection" !== op.type
        );
        if (isAstChange) {
          // Save the value to Local Storage.
          const content = JSON.stringify(value);
          localStorage.setItem("content", content);
        }
      }}
    >
      {isAdmin && (
        <div>
          <button onClick={() => turnIntoField()}>Turn into field</button>
          <button onClick={() => turnIntoEditable()}>Turn into editable</button>
          <button onClick={() => turnIntoReadonly()}>Turn into readonly</button>
          <button onClick={() => saveTemplate()}>Save template</button>
        </div>
      )}

      {!isAdmin && (
        <div>
          <button onClick={() => saveDocument()}>Save document</button>
          {getTemplatesIds().map((templateId) => (
            <button
              key={templateId}
              onClick={() => {
                const template = localStorage.getItem(templateId);

                if (template) {
                  const templateValue: Descendant[] = JSON.parse(template);

                  // Get initial total nodes to prevent deleting affecting the loop
                  let totalNodes = editor.children.length;

                  // No saved content, don't delete anything to prevent errors
                  if (templateValue.length <= 0) return;

                  // Remove every node except the last one
                  // Otherwise SlateJS will return error as there's no content
                  for (let i = 0; i < totalNodes - 1; i++) {
                    console.log(i);
                    Transforms.removeNodes(editor, {
                      at: [totalNodes - i - 1],
                    });
                  }

                  // Add content to SlateJS
                  for (const value of templateValue) {
                    Transforms.insertNodes(editor, value, {
                      at: [editor.children.length],
                    });
                  }

                  // Remove the last node that was leftover from before
                  Transforms.removeNodes(editor, {
                    at: [0],
                  });

                  templateIdRef.current = templateId;
                }
              }}
            >
              {templateId}
            </button>
          ))}
        </div>
      )}

      <div>
        <button onClick={() => setIsAdmin((isAdmin) => !isAdmin)}>
          {isAdmin ? "Change to End User" : "Change to Admin"}
        </button>
        {getDocumentsIds().map((documentId) => (
          <button
            key={documentId}
            onClick={() => {
              const document = localStorage.getItem(documentId);

              if (document) {
                const documentValue: Document = JSON.parse(document);

                const template = localStorage.getItem(documentValue.templateId);

                if (template) {
                  const templateValue: Descendant[] = JSON.parse(template);
                  const documentHtml = serializeToHtml(
                    templateValue,
                    documentValue.documentFields
                  );

                  setCurrentDocumentHtml(documentHtml);
                }
              }
            }}
          >
            {documentId}
          </button>
        ))}
      </div>

      <div>
        <Toolbar />
      </div>

      <div className={styles.container}>
        <Editable
          className={styles.editorArea}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          draggable={false}
          onDragStart={(e) => {
            if (!isAdmin) e.preventDefault();
          }}
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

      {currentDocumentHtml && <div>{parse(currentDocumentHtml)}</div>}
    </Slate>
  );
};
