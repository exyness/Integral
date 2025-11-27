import { motion } from "framer-motion";
import {
  Archive,
  ArchiveRestore,
  Edit,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { ghostScare } from "@/assets";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Dropdown } from "@/components/ui/Dropdown";
import { useTheme } from "@/contexts/ThemeContext";
import { useJournalQuery } from "@/hooks/queries/useJournalQuery";
import {
  useArchiveProject,
  useDeleteProject,
  useProjectsQuery,
  useUnarchiveProject,
} from "@/hooks/queries/useProjectsQuery";
import { Project } from "@/types/journal.ts";

interface ProjectsListProps {
  onEntryClick?: (entryId: string) => void;
  onProjectDetailsClick?: (project: Project) => void;
  onCreateProject?: () => void;
  onEditProject?: (project: Project) => void;
}

export const ProjectsList: React.FC<ProjectsListProps> = ({
  onProjectDetailsClick,
  onCreateProject,
  onEditProject,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { data: allProjects = [] } = useProjectsQuery();
  const { data: entries = [] } = useJournalQuery();
  const deleteProjectMutation = useDeleteProject();
  const archiveProjectMutation = useArchiveProject();
  const unarchiveProjectMutation = useUnarchiveProject();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<string | null>(
    null,
  );
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "entries" | "recent">("name");

  const { activeProjects, archivedProjects } = useMemo(() => {
    const filtered = allProjects.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const active = filtered.filter((p) => !p.archived);
    const archived = filtered.filter((p) => p.archived);

    const sortProjects = (projects: Project[]) => {
      return [...projects].sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.name.localeCompare(b.name);
          case "entries": {
            const aCount = entries.filter((e) => e.project_id === a.id).length;
            const bCount = entries.filter((e) => e.project_id === b.id).length;
            return bCount - aCount;
          }
          case "recent": {
            const aLatest = entries
              .filter((e) => e.project_id === a.id)
              .sort(
                (x, y) =>
                  new Date(y.created_at).getTime() -
                  new Date(x.created_at).getTime(),
              )[0];
            const bLatest = entries
              .filter((e) => e.project_id === b.id)
              .sort(
                (x, y) =>
                  new Date(y.created_at).getTime() -
                  new Date(x.created_at).getTime(),
              )[0];

            if (!aLatest && !bLatest) return 0;
            if (!aLatest) return 1;
            if (!bLatest) return -1;

            return (
              new Date(bLatest.created_at).getTime() -
              new Date(aLatest.created_at).getTime()
            );
          }
          default:
            return 0;
        }
      });
    };

    return {
      activeProjects: sortProjects(active),
      archivedProjects: sortProjects(archived),
    };
  }, [allProjects, searchTerm, sortBy, entries]);

  const handleEdit = (project: Project) => {
    onEditProject?.(project);
  };

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setDeleteConfirmOpen(project.id);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      await deleteProjectMutation.mutateAsync(projectToDelete.id);
      setDeleteConfirmOpen(null);
      setProjectToDelete(null);
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const handleCloseModal = () => {
    setDeleteConfirmOpen(null);
    setProjectToDelete(null);
  };

  const handleViewDetails = (project: Project) => {
    onProjectDetailsClick?.(project);
  };

  const handleArchive = (project: Project) => {
    archiveProjectMutation.mutateAsync(project.id).catch((error) => {
      console.error("Failed to archive project:", error);
    });
  };

  const handleUnarchive = (project: Project) => {
    unarchiveProjectMutation.mutateAsync(project.id).catch((error) => {
      console.error("Failed to unarchive project:", error);
    });
  };

  const getProjectEntryCount = (projectId: string) => {
    return entries.filter((entry) => entry.project_id === projectId).length;
  };

  return (
    <>
      {/* Search and Filters Bar */}
      <div className="space-y-4 p-4 md:p-6 border-b border-[rgba(255,255,255,0.1)]">
        {/* Main container for search and filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
          {/* Search Input (takes up available space) */}
          <div className="relative flex-1">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : "text-gray-400 dark:text-[#B4B4B8]"
              }`}
            />
            <input
              type="text"
              placeholder="Search budgets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none transition-colors text-xs md:text-sm ${
                isHalloweenMode
                  ? "bg-[#1a1a1f] border-[#60c9b6]/50 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                  : "bg-white dark:bg-[rgba(255,255,255,0.05)] border-gray-300 dark:border-[rgba(255,255,255,0.1)] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#B4B4B8] focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]"
              }`}
            />
          </div>
          {/* Filters and Sort Controls - Side by Side on Mobile, Separate on Desktop */}
          <div className="flex gap-3 lg:gap-3 lg:shrink-0">
            {/* Sort Dropdown - Takes 2/3 on mobile */}
            <div className="flex-[2] lg:w-48 lg:flex-none">
              <Dropdown
                value={sortBy}
                onValueChange={(value) =>
                  setSortBy(value as "name" | "entries" | "recent")
                }
                placeholder="Sort by..."
                options={[
                  { value: "name", label: "Sort by Name" },
                  { value: "entries", label: "Sort by Entries" },
                  { value: "recent", label: "Sort by Recent" },
                ]}
              />
            </div>

            {/* Archive Toggle - Takes 1/3 on mobile */}
            {archivedProjects.length > 0 && (
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-lg border transition-colors whitespace-nowrap cursor-pointer flex-[1] lg:flex-none lg:px-4 lg:space-x-2 ${
                  showArchived
                    ? "bg-[rgba(139,92,246,0.2)] border-[rgba(139,92,246,0.3)] text-[#8B5CF6]"
                    : isDark
                      ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#B4B4B8] hover:border-[rgba(139,92,246,0.3)]"
                      : "bg-white border-gray-200 text-gray-600 hover:border-purple-300"
                }`}
              >
                {showArchived ? (
                  <ArchiveRestore className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                ) : (
                  <Archive className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                )}
                <span className="text-xs lg:text-sm font-medium">
                  {showArchived ? "Archived" : "Active"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div
          className={`text-xs md:text-sm ${isDark ? "text-[#71717A]" : "text-gray-500"}`}
        >
          {showArchived ? archivedProjects.length : activeProjects.length}{" "}
          {(showArchived ? archivedProjects.length : activeProjects.length) ===
          1
            ? "project"
            : "projects"}{" "}
          found
          {archivedProjects.length > 0 && !showArchived && (
            <span className="ml-2">• {archivedProjects.length} archived</span>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {activeProjects.length === 0 && archivedProjects.length === 0 ? (
        <div className="p-6">
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {isHalloweenMode ? (
                <img
                  src={ghostScare}
                  alt="No projects"
                  className="w-24 h-24 mx-auto mb-4 opacity-80 drop-shadow-[0_0_10px_rgba(96,201,182,0.5)]"
                />
              ) : (
                <FolderOpen className="w-16 h-16 text-[#8B5CF6] mx-auto mb-4" />
              )}
            </motion.div>
            <h3
              className={`text-lg font-semibold mb-2 ${
                isHalloweenMode
                  ? "text-[#60c9b6] font-creepster tracking-wider"
                  : isDark
                    ? "text-white"
                    : "text-gray-900"
              }`}
            >
              {isHalloweenMode ? "No Spirits Summoned Yet" : "No projects yet"}
            </h3>
            <p
              className={`mb-6 text-sm ${
                isHalloweenMode
                  ? "text-[#60c9b6]/70"
                  : isDark
                    ? "text-[#B4B4B8]"
                    : "text-gray-600"
              }`}
            >
              {isHalloweenMode
                ? "Create your first ritual to organize your spectral entries"
                : "Create your first project to organize your journal entries"}
            </p>
            <button
              onClick={onCreateProject}
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 mx-auto text-sm ${
                isHalloweenMode
                  ? "bg-[#60c9b6]/20 text-[#60c9b6] border border-[#60c9b6]/50 hover:bg-[#60c9b6]/30 hover:shadow-[0_0_15px_rgba(96,201,182,0.4)]"
                  : "bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>
                {isHalloweenMode ? "Summon Project" : "Create Project"}
              </span>
            </button>
          </motion.div>
        </div>
      ) : (
        <>
          {/* Active Projects Section */}
          {!showArchived && activeProjects.length > 0 && (
            <div className="p-6">
              <h3
                className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Active Projects ({activeProjects.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {activeProjects.map((project, index) => {
                  const entryCount = getProjectEntryCount(project.id);

                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group relative cursor-pointer"
                      onClick={() => handleViewDetails(project)}
                    >
                      {/* Simple Project Card */}
                      <div
                        className={`relative rounded-xl p-4 transition-all duration-200 ${
                          isDark
                            ? "bg-[rgba(26,26,31,0.6)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] hover:bg-[rgba(40,40,45,0.6)]"
                            : "bg-white border border-gray-200 hover:border-gray-300 shadow-xs hover:shadow-md"
                        }`}
                      >
                        {/* Folder Icon */}
                        <div className="flex flex-col items-center space-y-3">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-105"
                            style={{
                              backgroundColor: `${project.color}15`,
                              border: `1px solid ${project.color}30`,
                            }}
                          >
                            <Folder
                              className="w-6 h-6"
                              style={{ color: project.color }}
                            />
                          </div>

                          {/* Project Name */}
                          <div className="text-center">
                            <h3
                              className="text-sm font-medium truncate max-w-[80px] transition-colors duration-200"
                              style={{
                                color: project.color,
                              }}
                            >
                              {project.name}
                            </h3>
                            <p
                              className={`text-xs mt-1 ${isDark ? "text-[#71717A]" : "text-gray-500"}`}
                            >
                              {entryCount}{" "}
                              {entryCount === 1 ? "entry" : "entries"}
                            </p>
                          </div>
                        </div>

                        {/* Action Menu - Three dots on mobile, individual buttons on desktop */}
                        <div className="absolute top-2 right-2">
                          {/* Mobile: Three dots menu */}
                          <div className="md:hidden relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(
                                  openMenuId === project.id ? null : project.id,
                                );
                              }}
                              className={`p-1 border rounded-md transition-all duration-200 cursor-pointer ${
                                isDark
                                  ? "bg-[#2A2A2F] hover:bg-[#35353A] border-[rgba(255,255,255,0.1)]"
                                  : "bg-white hover:bg-gray-50 shadow-xs border-gray-200"
                              }`}
                            >
                              <MoreHorizontal
                                className="w-3.5 h-3.5"
                                style={{ color: project.color }}
                              />
                            </button>

                            {/* Dropdown Menu */}
                            {openMenuId === project.id && (
                              <div
                                className={`absolute right-0 mt-1 w-28 rounded-lg shadow-lg z-10 overflow-hidden ${
                                  isDark
                                    ? "bg-[#2A2A2F] border border-[rgba(255,255,255,0.1)]"
                                    : "bg-white border border-gray-200"
                                }`}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    handleEdit(project);
                                  }}
                                  className="w-full px-2.5 py-1.5 text-left text-xs flex items-center space-x-1.5 transition-colors hover:bg-[rgba(255,255,255,0.05)]"
                                  style={{ color: project.color }}
                                >
                                  <Edit className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    handleArchive(project);
                                  }}
                                  disabled={archiveProjectMutation.isPending}
                                  className="w-full px-2.5 py-1.5 text-left text-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50 text-[#F59E0B] hover:bg-[rgba(255,255,255,0.05)]"
                                >
                                  <Archive className="w-3 h-3" />
                                  <span>Archive</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    handleDeleteClick(project);
                                  }}
                                  disabled={deleteProjectMutation.isPending}
                                  className="w-full px-2.5 py-1.5 text-left text-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50 text-red-500 hover:bg-[rgba(255,255,255,0.05)]"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Desktop: Individual buttons on hover */}
                          <div className="hidden md:flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(project);
                              }}
                              className={`p-1.5 border rounded-md transition-all duration-200 cursor-pointer ${
                                isDark
                                  ? "bg-[#2A2A2F] hover:bg-[#35353A]"
                                  : "bg-white hover:bg-gray-50 shadow-xs"
                              }`}
                              style={{
                                borderColor: `${project.color}30`,
                              }}
                              title="Edit project"
                            >
                              <Edit
                                className="w-3 h-3 transition-colors"
                                style={{ color: project.color }}
                              />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArchive(project);
                              }}
                              disabled={archiveProjectMutation.isPending}
                              className={`p-1.5 border rounded-md transition-all duration-200 disabled:opacity-50 cursor-pointer border-[rgba(245,158,11,0.3)] ${
                                isDark
                                  ? "bg-[#2A2A2F] hover:bg-[#35353A]"
                                  : "bg-white hover:bg-gray-50 shadow-xs"
                              }`}
                              title="Archive project"
                            >
                              <Archive className="w-3 h-3 text-[#F59E0B]" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(project);
                              }}
                              disabled={deleteProjectMutation.isPending}
                              className={`p-1.5 border rounded-md transition-all duration-200 disabled:opacity-50 cursor-pointer border-[rgba(239,68,68,0.3)] ${
                                isDark
                                  ? "bg-[#2A2A2F] hover:bg-[#35353A]"
                                  : "bg-white hover:bg-gray-50 shadow-xs"
                              }`}
                              title="Delete project"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </button>
                          </div>
                        </div>

                        {/* Entry Count Badge - Only for projects with entries */}
                        {entryCount > 0 && (
                          <div className="absolute top-2 left-2">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border"
                              style={{
                                backgroundColor: `${project.color}40`,
                                borderColor: `${project.color}60`,
                                color: project.color,
                                fontSize: "10px",
                              }}
                            >
                              {entryCount > 99 ? "99+" : entryCount}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Archived Projects Section */}
          {showArchived && archivedProjects.length > 0 && (
            <div className="p-6">
              <h3
                className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Archived Projects ({archivedProjects.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 opacity-60">
                {archivedProjects.map((project, index) => {
                  const entryCount = getProjectEntryCount(project.id);

                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group relative cursor-pointer opacity-60"
                      onClick={() => handleViewDetails(project)}
                    >
                      <div
                        className={`relative rounded-xl p-4 transition-all duration-200 ${
                          isDark
                            ? "bg-[rgba(26,26,31,0.6)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] hover:bg-[rgba(40,40,45,0.6)]"
                            : "bg-white border border-gray-200 hover:border-gray-300 shadow-xs hover:shadow-md"
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-3">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-105"
                            style={{
                              backgroundColor: `${project.color}15`,
                              border: `1px solid ${project.color}30`,
                            }}
                          >
                            <Folder
                              className="w-6 h-6"
                              style={{ color: project.color }}
                            />
                          </div>

                          <div className="text-center">
                            <h3
                              className="text-sm font-medium truncate max-w-[80px] transition-colors duration-200"
                              style={{
                                color: project.color,
                              }}
                            >
                              {project.name}
                            </h3>
                            <p
                              className={`text-xs mt-1 ${isDark ? "text-[#71717A]" : "text-gray-500"}`}
                            >
                              {entryCount}{" "}
                              {entryCount === 1 ? "entry" : "entries"}
                            </p>
                          </div>
                        </div>

                        {/* Action Menu for Archived - Three dots on mobile, individual buttons on desktop */}
                        <div className="absolute top-2 right-2">
                          {/* Mobile: Three dots menu */}
                          <div className="md:hidden relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(
                                  openMenuId === project.id ? null : project.id,
                                );
                              }}
                              className={`p-1 border rounded-md transition-all duration-200 cursor-pointer ${
                                isDark
                                  ? "bg-[#2A2A2F] hover:bg-[#35353A] border-[rgba(255,255,255,0.1)]"
                                  : "bg-white hover:bg-gray-50 shadow-xs border-gray-200"
                              }`}
                            >
                              <MoreHorizontal
                                className="w-3.5 h-3.5"
                                style={{ color: project.color }}
                              />
                            </button>

                            {/* Dropdown Menu */}
                            {openMenuId === project.id && (
                              <div
                                className={`absolute right-0 mt-1 w-28 rounded-lg shadow-lg z-10 overflow-hidden ${
                                  isDark
                                    ? "bg-[#2A2A2F] border border-[rgba(255,255,255,0.1)]"
                                    : "bg-white border border-gray-200"
                                }`}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    handleUnarchive(project);
                                  }}
                                  disabled={unarchiveProjectMutation.isPending}
                                  className="w-full px-2.5 py-1.5 text-left text-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50 text-[#10B981] hover:bg-[rgba(255,255,255,0.05)]"
                                >
                                  <ArchiveRestore className="w-3 h-3" />
                                  <span>Unarchive</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    handleDeleteClick(project);
                                  }}
                                  disabled={deleteProjectMutation.isPending}
                                  className="w-full px-2.5 py-1.5 text-left text-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50 text-red-500 hover:bg-[rgba(255,255,255,0.05)]"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Desktop: Individual buttons on hover */}
                          <div className="hidden md:flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnarchive(project);
                              }}
                              disabled={unarchiveProjectMutation.isPending}
                              className={`p-1.5 border rounded-md transition-all duration-200 disabled:opacity-50 cursor-pointer border-[rgba(16,185,129,0.3)] ${
                                isDark
                                  ? "bg-[#2A2A2F] hover:bg-[#35353A]"
                                  : "bg-white hover:bg-gray-50 shadow-xs"
                              }`}
                              title="Unarchive project"
                            >
                              <ArchiveRestore className="w-3 h-3 text-[#10B981]" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(project);
                              }}
                              disabled={deleteProjectMutation.isPending}
                              className={`p-1.5 border rounded-md transition-all duration-200 disabled:opacity-50 cursor-pointer border-[rgba(239,68,68,0.3)] ${
                                isDark
                                  ? "bg-[#2A2A2F] hover:bg-[#35353A]"
                                  : "bg-white hover:bg-gray-50 shadow-xs"
                              }`}
                              title="Delete project"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </button>
                          </div>
                        </div>

                        {entryCount > 0 && (
                          <div className="absolute top-2 left-2">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border"
                              style={{
                                backgroundColor: `${project.color}40`,
                                borderColor: `${project.color}60`,
                                color: project.color,
                                fontSize: "10px",
                              }}
                            >
                              {entryCount > 99 ? "99+" : entryCount}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Show Archived Button */}
          {archivedProjects.length > 0 && !showArchived && (
            <div className="p-6 border-t border-[rgba(255,255,255,0.1)]">
              <motion.button
                onClick={() => setShowArchived(true)}
                className={`w-full px-4 py-2.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-center space-x-2 ${
                  isHalloweenMode
                    ? "bg-[#60c9b6]/10 border border-[#60c9b6]/20 text-[#60c9b6] hover:bg-[#60c9b6]/20"
                    : "bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.2)]"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Archive className="w-4 h-4" />
                <span>Show Archived Projects ({archivedProjects.length})</span>
              </motion.button>
            </div>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmOpen !== null}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone and will remove all associated entries."
        itemTitle={projectToDelete?.name}
        itemDescription="Project and all associated data"
        confirmText="Delete Project"
        type="danger"
        isLoading={deleteProjectMutation.isPending}
      />
    </>
  );
};
