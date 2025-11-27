import { $createCodeNode } from "@lexical/code";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingTagType,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Code2,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Table,
  Underline,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface EditorToolbarProps {
  folderColor: string;
  compact?: boolean;
}

interface FormatState {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  isCode: boolean;
  blockType: string;
  elementFormat: string;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  folderColor,
  compact = false,
}) => {
  const { isDark } = useTheme();
  const [editor] = useLexicalComposerContext();
  const [formatState, setFormatState] = useState<FormatState>({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    isCode: false,
    blockType: "paragraph",
    elementFormat: "left",
  });

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();

      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      let blockType = "paragraph";
      if (element.getType() === "heading") {
        blockType = (element as unknown as { getTag(): string }).getTag();
      } else if (element.getType() === "quote") {
        blockType = "quote";
      } else if (element.getType() === "code") {
        blockType = "code";
      }

      setFormatState({
        isBold: selection.hasFormat("bold"),
        isItalic: selection.hasFormat("italic"),
        isUnderline: selection.hasFormat("underline"),
        isStrikethrough: selection.hasFormat("strikethrough"),
        isCode: selection.hasFormat("code"),
        blockType: blockType,
        elementFormat: elementDOM
          ? elementDOM.style.textAlign || "left"
          : "left",
      });
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      1,
    );
  }, [editor, updateToolbar]);

  const formatText = (
    format: "bold" | "italic" | "underline" | "strikethrough" | "code",
  ) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      }
    });
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatBulletList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const formatNumberedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  };

  const formatCodeBlock = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createCodeNode());
      }
    });
  };

  const formatAlignment = (
    alignment: "left" | "center" | "right" | "justify",
  ) => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
    }
  };

  const insertTable = () => {
    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns: "3",
      rows: "3",
      includeHeaders: true,
    });
  };

  const ToolbarButton: React.FC<{
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }> = ({ onClick, isActive = false, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-md transition-all duration-200 ${
        isActive
          ? `text-white shadow-sm`
          : `${isDark ? "text-[#B4B4B8] hover:text-white" : "text-gray-600 hover:text-gray-900"}`
      } ${isDark ? "hover:bg-[rgba(255,255,255,0.1)]" : "hover:bg-gray-100"}`}
      style={{
        backgroundColor: isActive ? folderColor : "transparent",
      }}
    >
      {children}
    </button>
  );

  const HeadingSelect: React.FC = () => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      console.log("Dropdown changed to:", value);

      setTimeout(() => {
        if (value === "paragraph") {
          console.log("Formatting paragraph");
          formatParagraph();
        } else if (value === "quote") {
          console.log("Formatting quote");
          formatQuote();
        } else if (value === "code") {
          console.log("Formatting code block");
          formatCodeBlock();
        } else {
          console.log("Formatting heading:", value);
          formatHeading(value as HeadingTagType);
        }
      }, 0);
    };

    return (
      <select
        className={`lexical-heading-select w-full rounded-lg px-3 py-2 text-sm focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] focus:outline-hidden cursor-pointer transition-all duration-200 hover:border-[rgba(139,92,246,0.5)] backdrop-blur-sm min-w-[120px] ${
          isDark
            ? "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[#B4B4B8] hover:text-white"
            : "bg-white border border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400"
        }`}
        onChange={handleChange}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onFocus={(e) => {
          e.stopPropagation();
        }}
        value={formatState.blockType}
      >
        <option value="paragraph">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="h4">Heading 4</option>
        <option value="h5">Heading 5</option>
        <option value="h6">Heading 6</option>
        <option value="quote">Quote</option>
        <option value="code">Code Block</option>
      </select>
    );
  };

  return (
    <div
      className={`flex items-center gap-1 px-3 py-2 border-b overflow-x-auto ${
        isDark
          ? "border-[rgba(255,255,255,0.1)] bg-[rgba(40,40,45,0.4)]"
          : "border-gray-200 bg-gray-50"
      }`}
      style={{ zIndex: 1 }}
    >
      {!compact && <HeadingSelect />}

      <div className="flex items-center gap-1 ml-2">
        <ToolbarButton
          onClick={() => formatText("bold")}
          isActive={formatState.isBold}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => formatText("italic")}
          isActive={formatState.isItalic}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => formatText("underline")}
          isActive={formatState.isUnderline}
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => formatText("strikethrough")}
          isActive={formatState.isStrikethrough}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => formatText("code")}
          isActive={formatState.isCode}
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <div
        className={`w-px h-6 mx-2 ${isDark ? "bg-[rgba(255,255,255,0.1)]" : "bg-gray-300"}`}
      />

      {/* Block Elements */}
      <div className="flex items-center gap-1">
        <ToolbarButton onClick={formatQuote} title="Quote Block">
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton onClick={formatCodeBlock} title="Code Block">
          <Code2 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton onClick={insertLink} title="Insert Link">
          <Link className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton onClick={insertTable} title="Insert Table">
          <Table className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <div
        className={`w-px h-6 mx-2 ${isDark ? "bg-[rgba(255,255,255,0.1)]" : "bg-gray-300"}`}
      />

      <div className="flex items-center gap-1">
        <ToolbarButton onClick={formatBulletList} title="Bullet List">
          <List className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton onClick={formatNumberedList} title="Numbered List">
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <div
        className={`w-px h-6 mx-2 ${isDark ? "bg-[rgba(255,255,255,0.1)]" : "bg-gray-300"}`}
      />

      {/* Alignment */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() => formatAlignment("left")}
          isActive={formatState.elementFormat === "left"}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => formatAlignment("center")}
          isActive={formatState.elementFormat === "center"}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => formatAlignment("right")}
          isActive={formatState.elementFormat === "right"}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => formatAlignment("justify")}
          isActive={formatState.elementFormat === "justify"}
          title="Justify"
        >
          <AlignJustify className="w-4 h-4" />
        </ToolbarButton>
      </div>
    </div>
  );
};
