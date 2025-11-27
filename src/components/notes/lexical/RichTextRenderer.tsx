import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { HashtagNode } from "@lexical/hashtag";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import React, { useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import "./lexical-editor.css";
import { RichTextRenderer } from ".";

interface RichTextRendererProps {
  content: string;
  theme?: "light" | "dark";
  maxLines?: number;
  className?: string;
}

const createRendererTheme = () => ({
  ltr: "ltr",
  rtl: "rtl",
  paragraph: "lexical-paragraph",
  quote: "lexical-quote",
  heading: {
    h1: "lexical-heading-h1",
    h2: "lexical-heading-h2",
    h3: "lexical-heading-h3",
    h4: "lexical-heading-h4",
    h5: "lexical-heading-h5",
    h6: "lexical-heading-h6",
  },
  list: {
    nested: {
      listitem: "lexical-nested-listitem",
    },
    ol: "lexical-list-ol",
    ul: "lexical-list-ul",
    listitem: "lexical-listitem",
  },
  image: "lexical-image",
  link: "lexical-link",
  text: {
    bold: "lexical-text-bold",
    italic: "lexical-text-italic",
    overflowed: "lexical-text-overflowed",
    hashtag: "lexical-hashtag",
    underline: "lexical-text-underline",
    strikethrough: "lexical-text-strikethrough",
    underlineStrikethrough: "lexical-text-underline-strikethrough",
    code: "lexical-text-code",
  },
  code: "lexical-code",
  table: "lexical-table",
  tableCell: "lexical-tableCell",
  tableHeaderCell: "lexical-tableHeaderCell",
  tableRow: "lexical-tableRow",
  hashtag: "lexical-hashtag",
});

function CodeCopyButtonPlugin() {
  const { isDark } = useTheme();

  useEffect(() => {
    const addCopyButtons = () => {
      const codeBlocks = document.querySelectorAll(
        ".lexical-renderer .lexical-code",
      );

      codeBlocks.forEach((block) => {
        if (block.querySelector(".code-copy-button")) return;

        const button = document.createElement("button");
        button.className = "code-copy-button";
        button.style.cssText = `
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 6px 8px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          transition: all 0.2s;
          z-index: 10;
          ${
            isDark
              ? "background: rgba(255,255,255,0.1); color: #B4B4B8;"
              : "background: rgba(0,0,0,0.05); color: #374151;"
          }
        `;

        const updateButton = (copied: boolean) => {
          button.innerHTML = copied
            ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Copied!</span>'
            : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span>Copy</span>';
          button.style.color = copied
            ? "#10b981"
            : isDark
              ? "#B4B4B8"
              : "#374151";
        };

        updateButton(false);

        button.addEventListener("mouseenter", () => {
          button.style.background = isDark
            ? "rgba(255,255,255,0.15)"
            : "rgba(0,0,0,0.08)";
        });

        button.addEventListener("mouseleave", () => {
          button.style.background = isDark
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.05)";
        });

        button.addEventListener("click", async () => {
          const code = block.textContent || "";
          try {
            await navigator.clipboard.writeText(code);
            updateButton(true);
            setTimeout(() => updateButton(false), 2000);
          } catch (err) {
            console.error("Failed to copy:", err);
          }
        });

        block.appendChild(button);
      });
    };

    const timer = setTimeout(addCopyButtons, 100);

    return () => clearTimeout(timer);
  }, [isDark]);

  return null;
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({
  content,
  theme,
  maxLines,
  className = "",
}) => {
  const { isDark } = useTheme();
  const actualTheme = theme || (isDark ? "dark" : "light");
  const isActuallyDark = actualTheme === "dark";

  let editorState: string;
  try {
    if (content.startsWith('{"root":')) {
      editorState = content;
    } else {
      editorState = JSON.stringify({
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: content,
                  type: "text",
                  version: 1,
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "paragraph",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "root",
          version: 1,
        },
      });
    }
  } catch (error) {
    return (
      <div
        className={`${className} ${isActuallyDark ? "text-white" : "text-gray-900"}`}
        style={
          maxLines
            ? ({
                display: "-webkit-box",
                WebkitLineClamp: maxLines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              } as React.CSSProperties)
            : undefined
        }
      >
        {content}
      </div>
    );
  }

  const initialConfig = {
    namespace: "RichTextRenderer",
    theme: createRendererTheme(),
    onError: (error: Error) => {
      console.error("Lexical Renderer Error:", error);
    },
    editorState: editorState,
    editable: false,
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
      AutoLinkNode,
      HashtagNode,
      TableNode,
      TableCellNode,
      TableRowNode,
    ],
  };

  return (
    <div
      className={`lexical-renderer ${className}`}
      style={
        {
          ...(maxLines
            ? {
                display: "-webkit-box",
                WebkitLineClamp: maxLines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            : {}),
          maxWidth: "100%",
          overflow: "hidden",
          wordWrap: "break-word",
        } as React.CSSProperties
      }
    >
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className={`lexical-content-editable-readonly outline-none ${
                isActuallyDark ? "text-white" : "text-gray-900"
              }`}
              style={{
                minHeight: "auto",
                cursor: "default",
              }}
            />
          }
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <CodeCopyButtonPlugin />
      </LexicalComposer>
    </div>
  );
};
