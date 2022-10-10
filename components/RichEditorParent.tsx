import { useState } from "react";
import { RichEditor } from "./RichEditor";

export const RichEditorParent = () => {
  const [isAdmin, setIsAdmin] = useState(true);

  return <RichEditor isAdmin={isAdmin} setIsAdmin={setIsAdmin} />;
};
