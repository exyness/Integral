import { motion } from "framer-motion";
import {
  ChevronDown,
  FileText,
  Folder as FolderIcon,
  FolderPlus,
  Grid,
  List,
  Pin,
  Plus,
  Search,
  Star,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Virtuoso, VirtuosoGrid } from "react-virtuoso";
import { toast } from "sonner";
import {
  cardPurpleWitchhouse,
  pumpkinSneaky,
  skullStaring,
  witchFly,
} from "../assets";
import { CreateFolderModal } from "../components/folders/CreateFolderModal";
import { FolderSidebar } from "../components/folders/FolderSidebar";
import { GlassCard } from "../components/GlassCard";
import { CreateNoteModal } from "../components/notes/CreateNoteModal";
import { EditNoteModal } from "../components/notes/EditNoteModal";
import { ViewNoteModal } from "../components/notes/ViewNoteModal";
import { NotesPageSkeleton } from "../components/skeletons/NoteSkeletons";
import { Button } from "../components/ui/Button.tsx";
import { ConfirmationModal } from "../components/ui/ConfirmationModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/DropdownMenu.tsx";
import { useTheme } from "../contexts/ThemeContext";
import { Folder, useFolders } from "../hooks/useFolders";
import { Note, useNotes } from "../hooks/useNotes";
import { useSpookyAI } from "../hooks/useSpookyAI";

type ViewMode = "grid" | "list";

const getShortId = (id: string) => id.substring(0, 8);

const findByShortId = <T extends { id: string }>(
  shortId: string,
  items: T[],
): T | undefined => {
  return items.find((item) => item.id.startsWith(shortId));
};

export const Notes: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "pinned" | "favorites">(
    "all",
  );
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [showDeleteFolder, setShowDeleteFolder] = useState(false);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [showViewNote, setShowViewNote] = useState(false);
  const [showEditNote, setShowEditNote] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const {
    folders,
    createFolder,
    deleteFolder,
    updateFolder,
    loading: foldersLoading,
  } = useFolders("note");
  const {
    notes,
    createNote,
    createNoteAsync,
    updateNote,
    deleteNote,
    loading: notesLoading,
  } = useNotes();
  const { addToGrimoire } = useSpookyAI();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[placeholder*="Search"]',
        ) as HTMLInputElement;
        searchInput?.focus();
      }

      if (e.key === "Escape" && searchQuery) {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement?.tagName === "INPUT") {
          setSearchQuery("");
          activeElement.blur();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchQuery]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional to avoid race condition
  useEffect(() => {
    const folderParam = searchParams.get("folder");
    if (folderParam && folders.length > 0) {
      const folder = folders.find((f) => f.id.startsWith(folderParam));
      if (folder && folder.id !== selectedFolder) {
        setSelectedFolder(folder.id);
      }
    }
  }, [folders, searchParams]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional to avoid race condition
  useEffect(() => {
    const noteParam = searchParams.get("note");

    if (noteParam && notes.length > 0) {
      const note = notes.find((n) => n.id.startsWith(noteParam));
      if (note) {
        if (!selectedNote || selectedNote !== note) {
          setSelectedNote(note);
          setShowViewNote(true);
          setShowEditNote(false);
        }
      }
    } else if (!noteParam && (showViewNote || showEditNote)) {
      setShowViewNote(false);
      setShowEditNote(false);
      setSelectedNote(null);
    }
  }, [searchParams, notes]);

  useEffect(() => {
    if (folders.length === 0) return;

    const currentFolderParam = searchParams.get("folder");
    const currentNoteParam = searchParams.get("note");

    const params: Record<string, string> = {};

    if (selectedFolder) {
      params.folder = getShortId(selectedFolder);
    }

    if (selectedNote) {
      params.note = getShortId(selectedNote.id);
    }

    const newFolderParam = params.folder || null;
    const newNoteParam = params.note || null;

    if (
      currentFolderParam !== newFolderParam ||
      currentNoteParam !== newNoteParam
    ) {
      setSearchParams(params, { replace: true });
    }
  }, [
    selectedFolder,
    selectedNote,
    setSearchParams,
    folders.length,
    searchParams,
  ]);

  const handleCreateFolder = async (name: string, color: string) => {
    try {
      await createFolder(name, color);
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  };

  const handleEditFolder = async (name: string, color: string) => {
    if (!editingFolder) return;

    try {
      await updateFolder(editingFolder.id, { name, color });
      setEditingFolder(null);
    } catch (error) {
      console.error("Failed to update folder:", error);
    }
  };

  const handleDeleteFolder = async () => {
    if (selectedFolder) {
      setIsDeletingFolder(true);
      try {
        await deleteFolder(selectedFolder);
        setShowDeleteFolder(false);
        setSelectedFolder(null);
      } catch (error) {
        console.error("Failed to delete folder:", error);
      } finally {
        setIsDeletingFolder(false);
      }
    }
  };

  const handleCreateNote = async (noteData: {
    title: string;
    content: string;
    rich_content?: string;
    content_type?: "plain" | "rich";
    category?: string;
    tags?: string[];
  }) => {
    try {
      const newNote = await createNoteAsync({
        ...noteData,
        folder_id: selectedFolder || undefined,
      });

      // Auto-index for search
      await addToGrimoire(`${noteData.title}\n\n${noteData.content}`, {
        type: "note",
        title: noteData.title,
        original_id: newNote.id,
        category: noteData.category,
        tags: noteData.tags,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  const handleViewNote = (note: Note) => {
    setSelectedNote(note);
    setShowViewNote(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setShowViewNote(false);
    setShowEditNote(true);
  };

  const handleUpdateNote = (noteId: string, updates: Partial<Note>) => {
    updateNote(noteId, updates);
    setShowEditNote(false);
    setShowViewNote(true);
  };

  const handleTogglePin = async (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    try {
      await updateNote(note.id, { is_pinned: !note.is_pinned });
      toast.success(note.is_pinned ? "Note unpinned" : "Note pinned");
    } catch (error) {
      console.error("Failed to toggle pin:", error);
      toast.error("Failed to toggle pin");
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    try {
      await updateNote(note.id, { is_favorite: !note.is_favorite });
      toast.success(
        note.is_favorite ? "Removed from favorites" : "Added to favorites",
      );
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast.error("Failed to toggle favorite");
    }
  };

  const handleDeleteNote = async (noteId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        deleteNote(noteId);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  const foldersWithCount = folders.map((folder) => ({
    id: folder.id,
    name: folder.name,
    color: folder.color,
    count: notes.filter((note) => note.folder_id === folder.id).length,
  }));

  const selectedFolderData = foldersWithCount.find(
    (f) => f.id === selectedFolder,
  );

  const filteredNotes = notes
    .filter((note) => {
      const searchLower = debouncedSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !searchLower ||
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower) ||
        note.category?.toLowerCase().includes(searchLower) ||
        note.tags?.some((tag) => tag.toLowerCase().includes(searchLower));
      const matchesFolder =
        !selectedFolder || note.folder_id === selectedFolder;
      const matchesFilter =
        filterMode === "all" ||
        (filterMode === "pinned" && note.is_pinned) ||
        (filterMode === "favorites" && note.is_favorite);
      return matchesSearch && matchesFolder && matchesFilter;
    })
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      if (a.is_favorite && !b.is_favorite) return -1;
      if (!a.is_favorite && b.is_favorite) return 1;
      return (
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    });

  const getActiveFolderColor = () => {
    if (isHalloweenMode) return "#60c9b6";
    if (!selectedFolder) {
      return "#8B5CF6";
    }
    const activeFolder = folders.find((f) => f.id === selectedFolder);
    return activeFolder?.color || "#8B5CF6";
  };

  const getNoteColor = (note: Note) => {
    if (isHalloweenMode) return "#60c9b6";
    if (selectedFolder) {
      return getActiveFolderColor();
    } else {
      if (note.folder_id) {
        const noteFolder = folders.find((f) => f.id === note.folder_id);
        return noteFolder?.color || "#8B5CF6";
      }
      return "#8B5CF6";
    }
  };

  const activeFolderColor = getActiveFolderColor();

  if ((notesLoading || foldersLoading) && notes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <NotesPageSkeleton viewMode={viewMode} />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex h-[calc(100vh-120px)] lg:h-[calc(100vh-80px)] relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile, slides in when opened */}
      <div
        className={`
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:relative
        fixed left-0 top-0 h-full z-50 lg:-mt-3 lg:z-auto
        transition-transform duration-300 ease-in-out
        lg:block
      `}
      >
        <FolderSidebar
          folders={foldersWithCount}
          selectedFolder={selectedFolder}
          onFolderSelect={(folderId) => {
            setSelectedFolder(folderId);
            setIsMobileSidebarOpen(false);
          }}
          onCreateFolder={() => setShowCreateFolder(true)}
          onEditFolder={() => {
            const folderToEdit = folders.find((f) => f.id === selectedFolder);
            if (folderToEdit) {
              setEditingFolder(folderToEdit);
              setShowCreateFolder(true);
            }
          }}
          onDeleteFolder={() => setShowDeleteFolder(true)}
          totalCount={notes.length}
          type="notes"
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 lg:overflow-hidden overflow-y-auto scrollbar-hide">
        {/* Header Section - Mobile Only */}
        <div className="mb-4 pt-4 px-3 lg:hidden">
          <div>
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <h1
                className="text-xl font-bold"
                style={{ color: activeFolderColor }}
              >
                Notes
              </h1>

              {/* Desktop Action Buttons */}
              <div className="hidden lg:flex items-center gap-2">
                <motion.button
                  onClick={() => setShowCreateNote(true)}
                  className="flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0"
                  style={{
                    backgroundColor: `${activeFolderColor}20`,
                    borderColor: `${activeFolderColor}50`,
                    color: activeFolderColor,
                    border: `1px solid ${activeFolderColor}50`,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Note</span>
                </motion.button>

                <motion.button
                  onClick={() => setShowCreateFolder(true)}
                  className="flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0"
                  style={{
                    backgroundColor: `${activeFolderColor}20`,
                    borderColor: `${activeFolderColor}50`,
                    color: activeFolderColor,
                    border: `1px solid ${activeFolderColor}50`,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>New Folder</span>
                </motion.button>
              </div>
            </div>
            <p
              className={`text-xs ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
            >
              {selectedFolder
                ? `Viewing notes in ${selectedFolderData?.name || "folder"}`
                : "Organize and manage all your notes"}
            </p>

            {/* Mobile Action Buttons - Below Description */}
            <div className="flex lg:hidden items-center gap-2 mt-3">
              <motion.button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0"
                style={{
                  backgroundColor: `${activeFolderColor}20`,
                  borderColor: `${activeFolderColor}50`,
                  color: activeFolderColor,
                  border: `1px solid ${activeFolderColor}50`,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FolderIcon className="w-3.5 h-3.5" />
                <span>Show Folders</span>
              </motion.button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    className="flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0"
                    style={{
                      backgroundColor: `${activeFolderColor}20`,
                      borderColor: `${activeFolderColor}50`,
                      color: activeFolderColor,
                      border: `1px solid ${activeFolderColor}50`,
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className={`${
                    isHalloweenMode
                      ? "bg-[rgba(26,26,31,0.95)] border-[rgba(96,201,182,0.2)]"
                      : isDark
                        ? "bg-[rgba(26,26,31,0.95)] border-[rgba(255,255,255,0.1)]"
                        : "bg-white border-gray-200"
                  } backdrop-blur-md`}
                >
                  <DropdownMenuItem
                    onClick={() => setShowCreateNote(true)}
                    className={`cursor-pointer ${isDark ? "hover:bg-[rgba(255,255,255,0.05)]" : "hover:bg-gray-100"}`}
                  >
                    <FileText
                      className="w-4 h-4 mr-2"
                      style={{ color: activeFolderColor }}
                    />
                    <span>New Note</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowCreateFolder(true)}
                    className={`cursor-pointer ${isDark ? "hover:bg-[rgba(255,255,255,0.05)]" : "hover:bg-gray-100"}`}
                  >
                    <FolderPlus
                      className="w-4 h-4 mr-2"
                      style={{ color: activeFolderColor }}
                    />
                    <span>New Folder</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <motion.div
          className="px-3 lg:px-4 pt-1 pb-3 lg:py-3 mb-2 space-y-2"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {/* Mobile: Search + View Mode */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="relative flex-1">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${searchQuery ? activeFolderColor : isDark ? "text-[#71717A]" : "text-gray-500"}`}
                style={searchQuery ? { color: activeFolderColor } : undefined}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 pr-9 py-1 rounded-lg w-full text-sm focus:outline-hidden transition-colors ${
                  isHalloweenMode
                    ? "bg-[rgba(96,201,182,0.05)] border border-[rgba(96,201,182,0.2)] text-white placeholder-[rgba(96,201,182,0.5)]"
                    : isDark
                      ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A]"
                      : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                style={
                  {
                    "--tw-ring-color": activeFolderColor,
                  } as React.CSSProperties
                }
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = activeFolderColor;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgb(209, 213, 219)";
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-md transition-all hover:scale-110 active:scale-95 ${isDark ? "hover:bg-[rgba(255,255,255,0.1)]" : "hover:bg-gray-100"}`}
                  style={{ color: activeFolderColor }}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            <div
              className={`flex rounded-lg p-0.5 ${
                isHalloweenMode
                  ? "bg-[rgba(96,201,182,0.1)] border border-[rgba(96,201,182,0.2)]"
                  : isDark
                    ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)]"
                    : "bg-gray-100 border border-gray-200"
              }`}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`h-6 px-1.5 transition-colors rounded ${viewMode === "grid" ? "" : `${isDark ? "text-[#B4B4B8] hover:text-white" : "text-gray-600 hover:text-gray-900"}`}`}
                style={{
                  backgroundColor:
                    viewMode === "grid"
                      ? `${activeFolderColor}30`
                      : "transparent",
                  color: viewMode === "grid" ? activeFolderColor : undefined,
                }}
              >
                <Grid className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={`h-6 px-1.5 transition-colors rounded ${viewMode === "list" ? "" : `${isDark ? "text-[#B4B4B8] hover:text-white" : "text-gray-600 hover:text-gray-900"}`}`}
                style={{
                  backgroundColor:
                    viewMode === "list"
                      ? `${activeFolderColor}30`
                      : "transparent",
                  color: viewMode === "list" ? activeFolderColor : undefined,
                }}
              >
                <List className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Desktop: Search + View Mode + New Button */}
          <div className="hidden lg:flex items-center gap-3 -mt-3">
            <div className="relative flex-1">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${searchQuery ? activeFolderColor : isDark ? "text-[#71717A]" : "text-gray-500"}`}
                style={searchQuery ? { color: activeFolderColor } : undefined}
              />
              <input
                type="text"
                placeholder="Search notes, tags, categories... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 pr-10 py-2 rounded-lg w-full text-sm focus:outline-hidden transition-colors ${
                  isHalloweenMode
                    ? "bg-[rgba(96,201,182,0.05)] border border-[rgba(96,201,182,0.2)] text-white placeholder-[rgba(96,201,182,0.5)]"
                    : isDark
                      ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A]"
                      : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                style={
                  {
                    "--tw-ring-color": activeFolderColor,
                  } as React.CSSProperties
                }
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = activeFolderColor;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgb(209, 213, 219)";
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md transition-all hover:scale-110 active:scale-95 ${isDark ? "hover:bg-[rgba(255,255,255,0.1)]" : "hover:bg-gray-100"}`}
                  style={{ color: activeFolderColor }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            <div
              className={`flex rounded-lg p-1 ${
                isHalloweenMode
                  ? "bg-[rgba(96,201,182,0.1)] border border-[rgba(96,201,182,0.2)]"
                  : isDark
                    ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)]"
                    : "bg-gray-100 border border-gray-200"
              }`}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`h-8 px-3 transition-colors rounded ${viewMode === "grid" ? "" : `${isDark ? "text-[#B4B4B8] hover:text-white" : "text-gray-600 hover:text-gray-900"}`}`}
                style={{
                  backgroundColor:
                    viewMode === "grid"
                      ? `${activeFolderColor}30`
                      : "transparent",
                  color: viewMode === "grid" ? activeFolderColor : undefined,
                }}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={`h-8 px-3 transition-colors rounded ${viewMode === "list" ? "" : `${isDark ? "text-[#B4B4B8] hover:text-white" : "text-gray-600 hover:text-gray-900"}`}`}
                style={{
                  backgroundColor:
                    viewMode === "list"
                      ? `${activeFolderColor}30`
                      : "transparent",
                  color: viewMode === "list" ? activeFolderColor : undefined,
                }}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Desktop New Dropdown Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  className="flex items-center justify-center space-x-1.5 px-4 py-2 cursor-pointer rounded-lg transition-colors text-sm font-medium shrink-0"
                  style={{
                    backgroundColor: `${activeFolderColor}20`,
                    borderColor: `${activeFolderColor}50`,
                    color: activeFolderColor,
                    border: `1px solid ${activeFolderColor}50`,
                  }}
                  whileHover={{ backgroundColor: `${activeFolderColor}40` }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4" />
                  <span>New</span>
                  <ChevronDown className="w-4 h-4" />
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={`${
                  isHalloweenMode
                    ? "bg-[rgba(26,26,31,0.95)] border-[rgba(96,201,182,0.2)]"
                    : isDark
                      ? "bg-[rgba(26,26,31,0.95)] border-[rgba(255,255,255,0.1)]"
                      : "bg-white border-gray-200"
                } backdrop-blur-md`}
              >
                <DropdownMenuItem
                  onClick={() => setShowCreateNote(true)}
                  className={`cursor-pointer ${isDark ? "hover:bg-[rgba(255,255,255,0.05)]" : "hover:bg-gray-100"}`}
                >
                  <FileText
                    className="w-4 h-4 mr-2"
                    style={{ color: activeFolderColor }}
                  />
                  <span>New Note</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowCreateFolder(true)}
                  className={`cursor-pointer ${isDark ? "hover:bg-[rgba(255,255,255,0.05)]" : "hover:bg-gray-100"}`}
                >
                  <FolderPlus
                    className="w-4 h-4 mr-2"
                    style={{ color: activeFolderColor }}
                  />
                  <span>New Folder</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Row 3 (Mobile & Desktop): Filter Buttons + Results Count */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 lg:gap-2">
              <Button
                onClick={() => setFilterMode("all")}
                className="flex items-center gap-0.5 lg:gap-1 px-1.5 lg:px-2.5 py-0 lg:py-1 rounded-lg transition-colors text-[10px] lg:text-xs cursor-pointer h-6 lg:h-auto"
                style={{
                  backgroundColor:
                    filterMode === "all"
                      ? `${activeFolderColor}30`
                      : `${activeFolderColor}10`,
                  borderColor:
                    filterMode === "all"
                      ? activeFolderColor
                      : `${activeFolderColor}30`,
                  color: activeFolderColor,
                  border: `1px solid ${filterMode === "all" ? activeFolderColor : `${activeFolderColor}30`}`,
                }}
              >
                <FileText className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                <span>All</span>
              </Button>

              <Button
                onClick={() => setFilterMode("pinned")}
                className="flex items-center gap-0.5 lg:gap-1 px-1.5 lg:px-2.5 py-0 lg:py-1 rounded-lg transition-colors text-[10px] lg:text-xs cursor-pointer h-6 lg:h-auto"
                style={{
                  backgroundColor:
                    filterMode === "pinned"
                      ? `${activeFolderColor}30`
                      : `${activeFolderColor}10`,
                  borderColor:
                    filterMode === "pinned"
                      ? activeFolderColor
                      : `${activeFolderColor}30`,
                  color: activeFolderColor,
                  border: `1px solid ${filterMode === "pinned" ? activeFolderColor : `${activeFolderColor}30`}`,
                }}
              >
                <Pin className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                <span>Pinned</span>
              </Button>

              <Button
                onClick={() => setFilterMode("favorites")}
                className="flex items-center gap-0.5 lg:gap-1 px-1.5 lg:px-2.5 py-0 lg:py-1 rounded-lg transition-colors text-[10px] lg:text-xs cursor-pointer h-6 lg:h-auto"
                style={{
                  backgroundColor:
                    filterMode === "favorites"
                      ? `${activeFolderColor}30`
                      : `${activeFolderColor}10`,
                  borderColor:
                    filterMode === "favorites"
                      ? activeFolderColor
                      : `${activeFolderColor}30`,
                  color: activeFolderColor,
                  border: `1px solid ${filterMode === "favorites" ? activeFolderColor : `${activeFolderColor}30`}`,
                }}
              >
                <Star className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                <span>Favorites</span>
              </Button>
            </div>

            {/* Results Counter */}
            {(searchQuery || debouncedSearchQuery) && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={`text-[10px] lg:text-xs px-2 py-1 rounded-full font-medium ${isDark ? "bg-[rgba(255,255,255,0.05)]" : "bg-gray-100"}`}
                style={{ color: activeFolderColor }}
              >
                {filteredNotes.length}{" "}
                {filteredNotes.length === 1 ? "result" : "results"}
              </motion.div>
            )}
          </div>
        </motion.div>

        <div className="flex-1 lg:overflow-hidden h-full">
          <div className="h-full px-3 pt-1 pb-3">
            {filteredNotes.length === 0 ? (
              <div className="relative overflow-hidden rounded-xl min-h-[400px] flex items-center justify-center p-8">
                {isHalloweenMode && (
                  <>
                    {filterMode === "pinned" ? (
                      <motion.img
                        src={witchFly}
                        alt=""
                        className="absolute top-8 right-8 w-20 md:w-24 opacity-15 pointer-events-none z-0 -scale-x-100"
                        style={{
                          filter:
                            "drop-shadow(0 0 20px rgba(96, 201, 182, 0.4))",
                        }}
                        animate={{
                          y: [0, -12, 0],
                          x: [0, 8, 0],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    ) : filterMode === "favorites" ? (
                      <motion.img
                        src={witchFly}
                        alt=""
                        className="absolute bottom-8 left-8 w-20 md:w-24 opacity-15 pointer-events-none z-0"
                        style={{
                          filter:
                            "drop-shadow(0 0 20px rgba(96, 201, 182, 0.4))",
                        }}
                        animate={{
                          y: [0, -10, 0],
                          rotate: [-3, 3, -3],
                        }}
                        transition={{
                          duration: 3.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    ) : (
                      <motion.img
                        src={witchFly}
                        alt=""
                        className="absolute top-8 left-8 w-20 md:w-24 opacity-15 pointer-events-none z-0 -scale-x-100"
                        style={{
                          filter:
                            "drop-shadow(0 0 20px rgba(96, 201, 182, 0.4))",
                        }}
                        animate={{
                          y: [0, -15, 0],
                          x: [0, 10, 0],
                          rotate: [0, 5, 0],
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                  </>
                )}
                <motion.div
                  className="relative z-10 text-center max-w-md mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {filterMode === "pinned" ? (
                    isHalloweenMode ? (
                      <motion.img
                        src={skullStaring}
                        alt=""
                        className="w-28 h-28 md:w-32 md:h-32 mx-auto mb-6 opacity-80"
                        style={{
                          filter:
                            "drop-shadow(0 0 30px rgba(96, 201, 182, 0.5))",
                        }}
                        animate={{
                          rotate: [-3, 3, -3],
                        }}
                        transition={{
                          duration: 3.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    ) : (
                      <div
                        className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: `${activeFolderColor}10`,
                          borderWidth: "2px",
                          borderStyle: "solid",
                          borderColor: `${activeFolderColor}30`,
                        }}
                      >
                        <Pin
                          className="w-7 h-7 md:w-9 md:h-9"
                          style={{ color: activeFolderColor }}
                        />
                      </div>
                    )
                  ) : filterMode === "favorites" ? (
                    isHalloweenMode ? (
                      <motion.img
                        src={pumpkinSneaky}
                        alt=""
                        className="w-28 h-28 md:w-32 md:h-32 mx-auto mb-6 opacity-80"
                        style={{
                          filter:
                            "drop-shadow(0 0 30px rgba(96, 201, 182, 0.5))",
                        }}
                        animate={{
                          y: [0, -8, 0],
                          rotate: [-5, 5, -5],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    ) : (
                      <div
                        className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: `${activeFolderColor}10`,
                          borderWidth: "2px",
                          borderStyle: "solid",
                          borderColor: `${activeFolderColor}30`,
                        }}
                      >
                        <Star
                          className="w-7 h-7 md:w-9 md:h-9"
                          style={{ color: activeFolderColor }}
                        />
                      </div>
                    )
                  ) : isHalloweenMode ? (
                    <motion.img
                      src={witchFly}
                      alt=""
                      className="w-28 h-28 md:w-32 md:h-32 mx-auto mb-6 opacity-80 -scale-x-100"
                      style={{
                        filter: "drop-shadow(0 0 30px rgba(96, 201, 182, 0.5))",
                      }}
                      animate={{
                        y: [0, -10, 0],
                        x: [0, 5, 0],
                        rotate: [0, 3, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ) : (
                    <div
                      className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: `${activeFolderColor}10`,
                        borderWidth: "2px",
                        borderStyle: "solid",
                        borderColor: `${activeFolderColor}30`,
                      }}
                    >
                      <FileText
                        className="w-9 h-9 md:w-11 md:h-11"
                        style={{ color: activeFolderColor }}
                      />
                    </div>
                  )}
                  <h3
                    className={`text-xl md:text-2xl font-bold mb-3 ${
                      isHalloweenMode
                        ? "text-[#60c9b6] font-creepster tracking-wide"
                        : isDark
                          ? "text-white"
                          : "text-gray-900"
                    }`}
                  >
                    {debouncedSearchQuery
                      ? isHalloweenMode
                        ? "No Matching Manuscripts"
                        : "No matching notes"
                      : filterMode === "pinned"
                        ? isHalloweenMode
                          ? "No Pinned Scrolls"
                          : "No pinned notes"
                        : filterMode === "favorites"
                          ? isHalloweenMode
                            ? "No Favorite Grimoires"
                            : "No favorite notes"
                          : isHalloweenMode
                            ? "No Mystical Manuscripts"
                            : "No notes yet"}
                  </h3>
                  <p
                    className={`mb-6 text-sm md:text-base ${
                      isHalloweenMode
                        ? "text-[#60c9b6]/70"
                        : isDark
                          ? "text-[#B4B4B8]"
                          : "text-gray-600"
                    }`}
                  >
                    {debouncedSearchQuery ? (
                      isHalloweenMode ? (
                        <>
                          No ancient texts found for "
                          <span className="font-medium">
                            {debouncedSearchQuery}
                          </span>
                          "
                          <br />
                          The mystical search yields no results
                        </>
                      ) : (
                        <>
                          No notes found for "
                          <span className="font-medium">
                            {debouncedSearchQuery}
                          </span>
                          "
                          <br />
                          Try different keywords or check your spelling
                        </>
                      )
                    ) : filterMode === "pinned" ? (
                      isHalloweenMode ? (
                        "Use enchanted pins to keep important manuscripts at the peak of your collection."
                      ) : (
                        "Pin important notes to keep them at the top"
                      )
                    ) : filterMode === "favorites" ? (
                      isHalloweenMode ? (
                        "Mark your most treasured manuscripts with a star to find them in the mystical library."
                      ) : (
                        "Mark notes as favorites to find them easily"
                      )
                    ) : isHalloweenMode ? (
                      "Your grimoire awaits its first enchantment. Summon your first note to begin the spell."
                    ) : (
                      "Create your first note to get started"
                    )}
                  </p>
                  {!searchQuery && filterMode === "all" && (
                    <motion.button
                      onClick={() => setShowCreateNote(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-lg transition-colors text-sm mx-auto cursor-pointer shadow-lg"
                      style={{
                        backgroundColor: `${activeFolderColor}20`,
                        borderColor: `${activeFolderColor}50`,
                        color: activeFolderColor,
                        border: `1px solid ${activeFolderColor}50`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${activeFolderColor}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `${activeFolderColor}20`;
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        {isHalloweenMode ? "Conjure Note" : "Create Note"}
                      </span>
                    </motion.button>
                  )}
                </motion.div>
              </div>
            ) : viewMode === "grid" ? (
              <VirtuosoGrid
                style={{ height: "100%" }}
                totalCount={filteredNotes.length}
                components={{
                  List: React.forwardRef<
                    HTMLDivElement,
                    React.HTMLAttributes<HTMLDivElement>
                  >((props, ref) => (
                    <div
                      {...props}
                      ref={ref}
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "0.75rem",
                        ...(props.style || {}),
                      }}
                    >
                      {props.children}
                    </div>
                  )),
                }}
                itemContent={(index) => {
                  const note = filteredNotes[index];
                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 }}
                    >
                      <GlassCard
                        variant="primary"
                        hover
                        className={`cursor-pointer transition-all duration-200 overflow-hidden aspect-square touch-manipulation relative group ${
                          isHalloweenMode
                            ? "border-[rgba(96,201,182,0.4)]! shadow-[0_0_15px_rgba(96,201,182,0.15)]! hover:border-[rgba(96,201,182,0.6)]!"
                            : ""
                        }`}
                        onClick={() => handleViewNote(note)}
                      >
                        {isHalloweenMode && (
                          <>
                            <div
                              className="absolute inset-0 pointer-events-none opacity-10 z-0"
                              style={{
                                backgroundImage: `url(${cardPurpleWitchhouse})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                filter: "grayscale(100%)",
                              }}
                            />
                            <motion.img
                              src={witchFly}
                              alt=""
                              className="absolute bottom-1 left-1 -scale-x-100 w-16 opacity-40 group-hover:opacity-60 transition-opacity duration-300 z-0"
                              animate={{
                                y: [0, -10, 0],
                                x: [0, 5, 0],
                                rotate: [0, 5, 0],
                              }}
                              transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            />
                          </>
                        )}
                        {/* Title Header */}
                        <div
                          className="p-3 border-b relative z-10"
                          style={{
                            backgroundColor: `${getNoteColor(note)}08`,
                            borderBottomColor: `${getNoteColor(note)}20`,
                          }}
                        >
                          <h3
                            className="font-bold text-sm font-sans transition-colors duration-200 line-clamp-2 pr-16"
                            style={{ color: getNoteColor(note) }}
                          >
                            {note.title}
                          </h3>

                          {/* Pin and Favorite Icons */}
                          <div className="absolute top-3 right-3 flex items-center space-x-1">
                            <button
                              onClick={(e) => handleTogglePin(e, note)}
                              className="p-1 rounded hover:bg-black/20 transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                              style={{
                                color: note.is_pinned
                                  ? getNoteColor(note)
                                  : `${getNoteColor(note)}40`,
                              }}
                            >
                              <Pin
                                className={`w-3.5 h-3.5 transition-transform ${note.is_pinned ? "fill-current" : ""}`}
                              />
                            </button>
                            <button
                              onClick={(e) => handleToggleFavorite(e, note)}
                              className="p-1 rounded hover:bg-black/20 transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                              style={{
                                color: note.is_favorite
                                  ? getNoteColor(note)
                                  : `${getNoteColor(note)}40`,
                              }}
                            >
                              <Star
                                className={`w-3.5 h-3.5 transition-transform ${note.is_favorite ? "fill-current" : ""}`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Content Preview */}
                        <div className="p-3 flex-1 flex flex-col relative z-10">
                          <div
                            className="mb-2 p-3 rounded-md overflow-hidden"
                            style={{
                              backgroundColor: `${getNoteColor(note)}08`,
                              border: `1px solid ${getNoteColor(note)}15`,
                              flex: "1 1 auto",
                              minHeight: 0,
                              display: "flex",
                              alignItems: "flex-start",
                            }}
                          >
                            <p
                              className={`text-sm leading-relaxed ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 10,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                alignSelf: "flex-start",
                              }}
                            >
                              {note.content
                                ? note.content.substring(0, 700)
                                : "No content available"}
                            </p>
                          </div>

                          {/* Footer */}
                          <div
                            className="flex items-center justify-between"
                            style={{ flexShrink: 0 }}
                          >
                            <span
                              className="px-2 py-1 text-xs rounded-full transition-all duration-200"
                              style={{
                                backgroundColor: `${getNoteColor(note)}20`,
                                color: getNoteColor(note),
                              }}
                            >
                              {note.category || "General"}
                            </span>
                            <span
                              className={`text-xs ${isDark ? "text-[#71717A]" : "text-gray-500"}`}
                            >
                              {new Date(note.updated_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                }}
              />
            ) : (
              <Virtuoso
                style={{ height: "100%" }}
                totalCount={filteredNotes.length}
                itemContent={(index) => {
                  const note = filteredNotes[index];
                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 0.05 }}
                      className="mb-2"
                    >
                      <GlassCard
                        variant="primary"
                        hover
                        className={`cursor-pointer transition-all duration-200 overflow-hidden touch-manipulation relative group ${
                          isHalloweenMode
                            ? "border-[rgba(96,201,182,0.4)]! shadow-[0_0_15px_rgba(96,201,182,0.15)]! hover:border-[rgba(96,201,182,0.6)]!"
                            : ""
                        }`}
                        onClick={() => handleViewNote(note)}
                      >
                        {isHalloweenMode && (
                          <>
                            <div
                              className="absolute inset-0 pointer-events-none opacity-10 z-0"
                              style={{
                                backgroundImage: `url(${cardPurpleWitchhouse})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                filter: "grayscale(100%)",
                              }}
                            />
                            <motion.img
                              src={witchFly}
                              alt=""
                              className="absolute -bottom-2 -right-2 w-16 opacity-40 group-hover:opacity-60 transition-opacity duration-300 z-0"
                              animate={{
                                y: [0, -10, 0],
                                x: [0, 5, 0],
                                rotate: [0, 5, 0],
                              }}
                              transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            />
                          </>
                        )}
                        {/* Mobile Layout - Stacked */}
                        <div className="block sm:hidden mobile-list-item relative z-10">
                          <div className="flex items-start space-x-3">
                            <FileText
                              className="w-5 h-5 shrink-0 mt-0.5"
                              style={{ color: getNoteColor(note) }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <h3
                                  className="font-medium text-base line-clamp-2 flex-1"
                                  style={{ color: getNoteColor(note) }}
                                >
                                  {note.title}
                                </h3>
                                <div className="flex items-center space-x-1 ml-2 shrink-0">
                                  <button
                                    onClick={(e) => handleTogglePin(e, note)}
                                    className="p-1 rounded hover:bg-black/20 transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                                    style={{
                                      color: note.is_pinned
                                        ? getNoteColor(note)
                                        : `${getNoteColor(note)}40`,
                                    }}
                                  >
                                    <Pin
                                      className={`w-3.5 h-3.5 transition-transform ${note.is_pinned ? "fill-current" : ""}`}
                                    />
                                  </button>
                                  <button
                                    onClick={(e) =>
                                      handleToggleFavorite(e, note)
                                    }
                                    className="p-1 rounded hover:bg-black/20 transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                                    style={{
                                      color: note.is_favorite
                                        ? getNoteColor(note)
                                        : `${getNoteColor(note)}40`,
                                    }}
                                  >
                                    <Star
                                      className={`w-3.5 h-3.5 transition-transform ${note.is_favorite ? "fill-current" : ""}`}
                                    />
                                  </button>
                                </div>
                              </div>
                              <p
                                className={`text-sm mb-3 line-clamp-2 mobile-list-content ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                              >
                                {note.content
                                  ? note.content.substring(0, 140)
                                  : "No content available"}
                              </p>
                              <div className="flex items-center justify-between">
                                <span
                                  className="px-2 py-1 text-xs rounded-full"
                                  style={{
                                    backgroundColor: `${getNoteColor(note)}20`,
                                    color: getNoteColor(note),
                                  }}
                                >
                                  {note.category || "General"}
                                </span>
                                <span
                                  className={`text-xs ${isDark ? "text-[#71717A]" : "text-gray-500"}`}
                                >
                                  {new Date(note.updated_at).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "2-digit",
                                    },
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Desktop/Tablet Layout - Horizontal */}
                        <div className="hidden sm:block p-3 md:tablet-list-spacing relative z-10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <FileText
                                className="w-4 h-4 shrink-0"
                                style={{ color: getNoteColor(note) }}
                              />
                              <div className="flex-1 min-w-0">
                                <h3
                                  className="font-medium text-sm transition-colors duration-200 truncate"
                                  style={{ color: getNoteColor(note) }}
                                >
                                  {note.title}
                                </h3>
                                <p
                                  className={`text-xs mt-0.5 truncate ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                                >
                                  {note.content
                                    ? note.content.substring(0, 80) + "..."
                                    : "No content"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 shrink-0 ml-4">
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={(e) => handleTogglePin(e, note)}
                                  className="p-1 rounded hover:bg-black/20 transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                                  style={{
                                    color: note.is_pinned
                                      ? getNoteColor(note)
                                      : `${getNoteColor(note)}40`,
                                  }}
                                >
                                  <Pin
                                    className={`w-3.5 h-3.5 transition-transform ${note.is_pinned ? "fill-current" : ""}`}
                                  />
                                </button>
                                <button
                                  onClick={(e) => handleToggleFavorite(e, note)}
                                  className="p-1 rounded hover:bg-black/20 transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                                  style={{
                                    color: note.is_favorite
                                      ? getNoteColor(note)
                                      : `${getNoteColor(note)}40`,
                                  }}
                                >
                                  <Star
                                    className={`w-3.5 h-3.5 transition-transform ${note.is_favorite ? "fill-current" : ""}`}
                                  />
                                </button>
                              </div>
                              <span
                                className="px-2 py-0.5 text-xs rounded hidden md:inline-block"
                                style={{
                                  backgroundColor: `${getNoteColor(note)}20`,
                                  color: getNoteColor(note),
                                }}
                              >
                                {note.category || "General"}
                              </span>
                              <span
                                className={`text-xs whitespace-nowrap ${isDark ? "text-[#71717A]" : "text-gray-500"}`}
                              >
                                {new Date(note.updated_at).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                  },
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                }}
              />
            )}
          </div>
        </div>

        {/* Modals */}
        <CreateFolderModal
          isOpen={showCreateFolder}
          onClose={() => {
            setShowCreateFolder(false);
            setEditingFolder(null);
          }}
          onCreateFolder={editingFolder ? handleEditFolder : handleCreateFolder}
          type="notes"
          folderToEdit={editingFolder}
        />

        <ConfirmationModal
          isOpen={showDeleteFolder}
          onClose={() => setShowDeleteFolder(false)}
          onConfirm={handleDeleteFolder}
          title="Delete Folder"
          description="Are you sure you want to delete this folder? All notes within this folder will be permanently deleted. This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isLoading={isDeletingFolder}
        />

        <CreateNoteModal
          isOpen={showCreateNote}
          onClose={() => setShowCreateNote(false)}
          onCreateNote={handleCreateNote}
        />

        {selectedNote && (
          <>
            <ViewNoteModal
              isOpen={showViewNote}
              onClose={() => {
                setShowViewNote(false);
                setSelectedNote(null);
                const params = new URLSearchParams(searchParams);
                params.delete("note");
                setSearchParams(params);
              }}
              note={selectedNote}
              onEdit={() => handleEditNote(selectedNote)}
              onDelete={() => handleDeleteNote(selectedNote.id)}
            />

            <EditNoteModal
              isOpen={showEditNote}
              onClose={() => {
                setShowEditNote(false);
                setShowViewNote(true);
              }}
              onUpdateNote={handleUpdateNote}
              note={selectedNote}
            />
          </>
        )}
      </div>
    </motion.div>
  );
};
