import { Editor } from "slate";

export const withEditable = (editor: Editor, isAdmin: boolean) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (unit) => {
    if (isAdmin) deleteBackward(unit);
  };

  return editor;
};
