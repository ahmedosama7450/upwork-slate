import { Editor, Text } from "slate";

export const withEditable = (
  editor: Editor,
  isAdminState: { isAdmin: boolean }
) => {
  const {
    deleteBackward,
    deleteForward,
    deleteFragment,
    insertBreak,
    insertFragment,
    insertNode,
    insertText,
    insertData,
    insertFragmentData,
    insertTextData,
    insertSoftBreak,
  } = editor;

  editor.deleteBackward = (unit) => {
    if (isAdminState.isAdmin) deleteBackward(unit);
    else {
      const [match] = Editor.nodes(editor, {
        match: (n) => Text.isText(n) && n.editable === false,
      });
      if (!match) {
        deleteBackward(unit);
      }
    }
  };

  editor.deleteForward = (unit) => {
    if (isAdminState.isAdmin) deleteForward(unit);
    else {
      const [match] = Editor.nodes(editor, {
        match: (n) => Text.isText(n) && n.editable === false,
      });
      if (!match) {
        deleteForward(unit);
      }
    }
  };

  editor.deleteFragment = (direction) => {
    if (isAdminState.isAdmin) deleteFragment(direction);
  };

  /*   editor.insertBreak = () => {
    if (isAdminState.isAdmin) insertBreak();
  };

  editor.insertFragment = (fragment) => {
    if (isAdminState.isAdmin) insertFragment(fragment);
  };

  editor.insertNode = (node) => {
    if (isAdminState.isAdmin) insertNode(node);
  };

  editor.insertText = (text) => {
    if (isAdminState.isAdmin) insertText(text);
  }; */

  return editor;
};
