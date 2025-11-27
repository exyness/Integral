import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { HashtagNode } from "@lexical/hashtag";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { TRANSFORMERS } from "@lexical/markdown";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { $getRoot, EditorState } from "lexical";
import React, { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import "./lexical-editor.css";
import { EditorToolbar } from "@/components/notes/lexical/EditorToolbar";

interface LexicalRichTextEditorProps {
  initialContent?: string;
  onChange: (content: string, plainText: string) => void;
  placeholder?: string;
  folderColor?: string;
  readOnly?: boolean;
  autoFocus?: boolean;
}

const createEditorTheme = () => ({
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
  codeHighlight: {
    atrule: "lexical-token-attr",
    attr: "lexical-token-attr",
    boolean: "lexical-token-property",
    builtin: "lexical-token-selector",
    cdata: "lexical-token-comment",
    char: "lexical-token-selector",
    class: "lexical-token-function",
    "class-name": "lexical-token-function",
    comment: "lexical-token-comment",
    constant: "lexical-token-property",
    deleted: "lexical-token-property",
    doctype: "lexical-token-comment",
    entity: "lexical-token-operator",
    function: "lexical-token-function",
    important: "lexical-token-variable",
    inserted: "lexical-token-selector",
    keyword: "lexical-token-attr",
    namespace: "lexical-token-variable",
    number: "lexical-token-property",
    operator: "lexical-token-operator",
    prolog: "lexical-token-comment",
    property: "lexical-token-property",
    punctuation: "lexical-token-punctuation",
    regex: "lexical-token-variable",
    selector: "lexical-token-selector",
    string: "lexical-token-selector",
    symbol: "lexical-token-property",
    tag: "lexical-token-property",
    url: "lexical-token-operator",
    variable: "lexical-token-variable",
  },
});

function OnChangeHandler({
  onChange,
}: {
  onChange: (content: string, plainText: string) => void;
}) {
  const handleChange = useCallback(
    (editorState: EditorState) => {
      editorState.read(() => {
        const root = $getRoot();
        const rawPlainText = root.getTextContent();

        const plainText = rawPlainText
          .replace(/[\u200B-\u200D\uFEFF]/g, "")
          .replace(/\u00A0/g, " ")
          .trim();
        const serializedState = JSON.stringify(editorState.toJSON());
        onChange(serializedState, plainText);
      });
    },
    [onChange],
  );

  return <OnChangePlugin onChange={handleChange} />;
}

function Placeholder({ text, isDark }: { text: string; isDark: boolean }) {
  return (
    <div
      className={`absolute top-3 left-3 pointer-events-none select-none text-sm ${
        isDark ? "text-[#71717A]" : "text-gray-500"
      }`}
      style={{
        lineHeight: "1.6",
        fontSize: "14px",
      }}
    >
      {text}
    </div>
  );
}

export const LexicalRichTextEditor: React.FC<LexicalRichTextEditorProps> = ({
  initialContent,
  onChange,
  placeholder = "Start writing...",
  folderColor = "#8B5CF6",
  readOnly = false,
  autoFocus = false,
}) => {
  const { isDark } = useTheme();
  const [isEditorReady, setIsEditorReady] = useState(false);

  const getInitialEditorState = () => {
    if (!initialContent) return undefined;

    try {
      if (initialContent.startsWith('{"root":')) {
        JSON.parse(initialContent);
        return initialContent;
      }
    } catch (error) {
      // If JSON parsing fails, treat as plain text
    }

    return JSON.stringify({
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: initialContent,
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
  };

  // noinspection JSUnusedGlobalSymbols
  const initialConfig = {
    namespace: "RichTextEditor",
    theme: createEditorTheme(),
    onError: (error: Error) => {
      console.error("Lexical Editor Error:", error);
    },
    editorState: getInitialEditorState(),
    editable: !readOnly,
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

  useEffect(() => {
    setIsEditorReady(true);
  }, []);

  if (!isEditorReady) {
    return (
      <div
        className={`min-h-[200px] rounded-lg border p-3 ${
          isDark
            ? "bg-[rgba(40,40,45,0.6)] border-[rgba(255,255,255,0.1)] text-white"
            : "bg-white border-gray-300 text-gray-900"
        }`}
      >
        <div className={`${isDark ? "text-[#71717A]" : "text-gray-500"}`}>
          Loading editor...
        </div>
      </div>
    );
  }

  return (
    <div className="lexical-editor-container">
      <LexicalComposer initialConfig={initialConfig}>
        <div
          className={`lexical-editor-wrapper rounded-lg border transition-colors overflow-hidden ${
            isDark
              ? "bg-[rgba(40,40,45,0.6)] border-[rgba(255,255,255,0.1)]"
              : "bg-white border-gray-300"
          }`}
          style={
            {
              "--editor-focus-color": folderColor,
            } as React.CSSProperties
          }
        >
          {!readOnly && <EditorToolbar folderColor={folderColor} />}
          <div className="lexical-editor-inner p-3 relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className={`lexical-content-editable min-h-[200px] outline-none relative z-10 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                  style={{ caretColor: folderColor }}
                  autoFocus={autoFocus}
                />
              }
              placeholder={<Placeholder text={placeholder} isDark={isDark} />}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <OnChangeHandler onChange={onChange} />
            <HistoryPlugin />
            <ListPlugin />
            <LinkPlugin />
            <CheckListPlugin />
            <HashtagPlugin />
            <TablePlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <TabIndentationPlugin />
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
};
