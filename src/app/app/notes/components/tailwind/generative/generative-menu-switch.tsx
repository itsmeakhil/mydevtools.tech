import { EditorBubble, useEditor } from "novel";
import { Fragment, type ReactNode } from "react";

interface GenerativeMenuSwitchProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GenerativeMenuSwitch = ({ children }: GenerativeMenuSwitchProps) => {
  const { editor } = useEditor();

  return (
    <EditorBubble
      tippyOptions={{
        placement: "top",
        onHidden: () => {
          editor?.chain().unsetHighlight().run();
        },
      }}
      className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-muted bg-background shadow-xl"
    >
      <Fragment>
        {children}
      </Fragment>
    </EditorBubble>
  );
};

export default GenerativeMenuSwitch;