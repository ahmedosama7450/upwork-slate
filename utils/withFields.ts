import { Editor } from "slate";

export const withFields = (editor: Editor) => {
  const { isInline, isVoid } = editor;

  editor.isInline = (element) => {
    return element.type === "field" ? true : isInline(element);
  };

  editor.isVoid = (element) => {
    return element.type === "field" ? true : isVoid(element);
  };

  return editor;
};
