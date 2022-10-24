import { Editor, Transforms } from "slate";
import { Transform } from "stream";
import {
  Heading2Element,
  Heading1Element,
  ParagraphElement,
} from "../components/RichEditor";

export const EditorUtils = {
  setAlignment: (editor: Editor, align: ParagraphElement["align"]) => {
    Transforms.setNodes(
      editor,
      { align },
      {
        match: (n) => Editor.isBlock(editor, n) && n.type === "paragraph",
      }
    );
  },

  isActiveBlock: (
    editor: Editor,
    type:
      | ParagraphElement["type"]
      | Heading1Element["type"]
      | Heading2Element["type"]
  ) => {
    const [match] = Editor.nodes(editor, {
      match: (n) => Editor.isBlock(editor, n) && n.type === type,
      mode: "highest",
    });

    return !!match;
  },

  toggleBlock(
    editor: Editor,
    type:
      | ParagraphElement["type"]
      | Heading1Element["type"]
      | Heading2Element["type"]
  ) {
    const isActive = EditorUtils.isActiveBlock(editor, type);

    Transforms.setNodes(
      editor,
      { type: isActive ? "paragraph" : type },
      { match: (n) => Editor.isBlock(editor, n) }
    );
  },
};
