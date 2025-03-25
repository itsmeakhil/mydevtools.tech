"use client";

import "../../styles/globals.css";
import "../../styles/prosemirror.css";
import 'katex/dist/katex.min.css';

import { defaultEditorContent } from "../../lib/content";
import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  ImageResizer,
  type JSONContent,
  handleCommandNavigation,
  handleImageDrop,
  handleImagePaste,
} from "novel";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { MathSelector } from "./selectors/math-selector";
import { NodeSelector } from "./selectors/node-selector";
import { Separator } from "../../../../../components/ui/separator";

import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { uploadFn } from "./image-upload";
import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "./slash-command";
// import hljs from "highlight.js";

const extensions = [...defaultExtensions, slashCommand];

interface TailwindAdvancedEditorProps {
  initialTitle?: string;
  initialContent?: JSONContent;
  onTitleChange?: (title: string) => void;
  onContentChange?: (content: JSONContent) => void;
  saveStatus?: string;
}

const TailwindAdvancedEditor = ({
  initialTitle = "Untitled Note",
  initialContent: propInitialContent,
  onTitleChange,
  onContentChange,
  saveStatus: externalSaveStatus
}: TailwindAdvancedEditorProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [initialContent, setInitialContent] = useState<null | JSONContent>(null);
  const [saveStatus, setSaveStatus] = useState(externalSaveStatus || "Saved");
  const [charsCount, setCharsCount] = useState();

  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);

  // Either remove the function entirely if not needed, or use it in the component.
  // Commenting it out for now since it seems to be intended for future use
  /*
  //Apply Codeblock Highlighting on the HTML from editor.getHTML()
  const highlightCodeblocks = (content: string) => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    doc.querySelectorAll("pre code").forEach((el) => {
      // @ts-expect-error - highlightElement expects HTMLElement but querySelector returns Element
      // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
      hljs.highlightElement(el);
    });
    return new XMLSerializer().serializeToString(doc);
  };
  */

  const debouncedUpdates = useDebouncedCallback(async (editor: EditorInstance) => {
    const json = editor.getJSON();
    setCharsCount(editor.storage.characterCount.words());
    
    // Call onContentChange if provided and set save status
    if (onContentChange) {
      onContentChange(json);
      // Don't set saveStatus here, as parent component controls it through externalSaveStatus
    } else {
      setSaveStatus("Unsaved");
    }
  }, 500);
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (onTitleChange) {
      onTitleChange(newTitle);
      // Don't set saveStatus here, as parent component controls it through externalSaveStatus
    } else {
      setSaveStatus("Unsaved");
    }
  };

  useEffect(() => {
    // Set initial content from props, not from localStorage
    if (propInitialContent) {
      setInitialContent(propInitialContent);
    } else {
      setInitialContent(defaultEditorContent);
    }
  }, [propInitialContent]);

  // Update save status when it changes externally
  useEffect(() => {
    if (externalSaveStatus) {
      setSaveStatus(externalSaveStatus);
    }
  }, [externalSaveStatus]);

  if (!initialContent) return null;

  return (
    <div className="relative w-full max-w-screen-lg">
      <div className="flex absolute right-5 top-5 z-10 mb-5 gap-2">
        <div className="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground">{saveStatus}</div>
        <div className={charsCount ? "rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground" : "hidden"}>
          {charsCount} Words
        </div>
      </div>
      <EditorRoot>
        {/* Move the title outside EditorContent but inside EditorRoot */}
        <div className="relative w-full max-w-screen-lg sm:rounded-t-lg sm:border-t sm:border-l sm:border-r sm:shadow-lg border-muted bg-background pt-8 px-8 pb-2">
          <input
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled Note"
            className="w-full border-none bg-transparent text-4xl font-bold focus:outline-none"
            aria-label="Note Title"
          />
          <div className="w-full border-b border-gray-200 dark:border-gray-700 mt-2"></div>
        </div>
        <EditorContent
          initialContent={initialContent}
          extensions={extensions}
          className="relative min-h-[500px] w-full max-w-screen-lg sm:mb-[calc(20vh)] sm:rounded-b-lg sm:border-b sm:border-l sm:border-r sm:shadow-lg border-muted bg-background pt-4"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) => handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class:
                "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
          onUpdate={({ editor }) => {
            debouncedUpdates(editor);
            setSaveStatus("Unsaved");
          }}
          slotAfter={<ImageResizer />}
        >
          <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">No results</EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command && item.command(val)}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                  key={item.title}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
            <Separator orientation="vertical" />
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
            <Separator orientation="vertical" />

            <LinkSelector open={openLink} onOpenChange={setOpenLink} />
            <Separator orientation="vertical" />
            <MathSelector />
            <Separator orientation="vertical" />
            <TextButtons />
            <Separator orientation="vertical" />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </GenerativeMenuSwitch>
        </EditorContent>
      </EditorRoot>
    </div>
  );
};

export default TailwindAdvancedEditor;