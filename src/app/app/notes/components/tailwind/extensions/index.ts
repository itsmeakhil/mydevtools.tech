import { StarterKit } from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import { Image } from "@tiptap/extension-image";
import { Youtube } from "@tiptap/extension-youtube";
import { Markdown } from "tiptap-markdown";
// import { Math } from "@tiptap-pro/extension-math";
// import { Tweet } from "@tiptap-pro/extension-tweet";
// import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
// import { lowlight } from "lowlight";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { CharacterCount } from "@tiptap/extension-character-count";
import { Link } from "@tiptap/extension-link";

export const defaultExtensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
    codeBlock: false, // We'll use the CodeBlockLowlight instead
  }),
  Highlight,
  TaskList,
  TaskItem.configure({
    nested: true,
    HTMLAttributes: {
      class: "flex items-start my-4",
    },
  }),
  Placeholder.configure({
    placeholder: "Start writing...",
  }),
  Image.configure({
    allowBase64: true,
    HTMLAttributes: {
      class: "rounded-lg border border-muted",
    },
  }),
  Youtube.configure({
    HTMLAttributes: {
      class: "w-full aspect-video rounded-lg overflow-hidden",
    },
  }),
  // Tweet.configure({
  //   HTMLAttributes: {
  //     class: "flex justify-center my-4",
  //   },
  // }),
  // Math.configure({}),
  // CodeBlockLowlight.configure({
  //   lowlight,
  //   HTMLAttributes: {
  //     class: "rounded-md p-4 my-4 bg-zinc-950 text-zinc-200 dark:bg-zinc-900",
  //   },
  // }),
  TextStyle,
  Color,
  CharacterCount,
  Link.configure({
    HTMLAttributes: {
      class: "text-primary underline decoration-primary underline-offset-4",
    },
  }),
  Markdown.configure({
    html: false,
    transformPastedText: true,
    transformCopiedText: true,
  }),
];
