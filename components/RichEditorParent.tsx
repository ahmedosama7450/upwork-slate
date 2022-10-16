import { useEffect, useState } from "react";
import { Descendant } from "slate";
import { RichEditor } from "./RichEditor";

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

export const RichEditorParent = () => {
  const [initialValueState, setInitialValueState] = useState<
    Descendant[] | null
  >(null);

  useEffect(() => {
    setInitialValueState(
      JSON.parse(localStorage.getItem("content") || "null") || initialValue
    );
  }, []);

  return initialValueState ? (
    <RichEditor initialValue={initialValueState} />
  ) : (
    <>Editor value is loading</>
  );
};
