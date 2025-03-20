import React from "react";
import TailwindAdvancedEditor from "./components/tailwind/advanced-editor";

const Notes = () => {
  return (
    <div className="flex min-h-screen flex-col items-center gap-4 py-4 sm:px-5">
      <TailwindAdvancedEditor/>
    </div>
  );
};

export default Notes;
