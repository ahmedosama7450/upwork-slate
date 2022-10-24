import { Editor, Transforms } from "slate";
import { useSlateStatic } from "slate-react";
import { EditorUtils } from "../utils/EditorUtils";

export const Toolbar = () => {
  const editor = useSlateStatic();

  return (
    <div>
      <button
        onClick={() => {
          EditorUtils.toggleBlock(editor, "heading1");
        }}
      >
        H1
      </button>
      <button
        onClick={() => {
          EditorUtils.toggleBlock(editor, "heading2");
        }}
      >
        H2
      </button>
      <button
        onClick={() => {
          EditorUtils.setAlignment(editor, "left");
        }}
      >
        Align Left
      </button>
      <button
        onClick={() => {
          EditorUtils.setAlignment(editor, "center");
        }}
      >
        Align Center
      </button>
      <button
        onClick={() => {
          EditorUtils.setAlignment(editor, "right");
        }}
      >
        Align Right
      </button>
      <button
        onClick={() => {
          EditorUtils.setAlignment(editor, "justify");
        }}
      >
        Justify
      </button>
    </div>
  );
};
