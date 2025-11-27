import { motion } from "framer-motion";
import {
  Archive,
  ArchiveRestore,
  Folder,
  MoreHorizontal,
  Search,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import {
  cardPurpleWitchhouse,
  ghostGenie,
  witchFly,
  witchTakeoff,
} from "@/assets";
import { GlassCard } from "@/components/GlassCard";
import { Dropdown } from "@/components/ui/Dropdown";
import { useTheme } from "@/contexts/ThemeContext";
import { useArchivedProjects } from "@/hooks/useArchivedProjects";
import { Project } from "@/hooks/useProjects";

interface ProjectListProps {
  projects: Project[];
  onProjectClick: (projectName: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onProjectClick,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { archivedProjects, archiveProject, unarchiveProject, isArchived } =
    useArchivedProjects();

  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "tasks" | "completion">("name");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    const filtered = projects.filter((project) => {
      const matchesSearch = project.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesArchive = showArchived
        ? isArchived(project.name)
        : !isArchived(project.name);
      return matchesSearch && matchesArchive;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "tasks":
          return b.taskCount - a.taskCount;
        case "completion":
          return b.completionRate - a.completionRate;
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, searchTerm, showArchived, sortBy, isArchived]);

  if (projects.length === 0) {
    return (
      <GlassCard>
        <div className="relative overflow-hidden rounded-xl min-h-[400px] flex items-center justify-center p-8">
          {isHalloweenMode && (
            <div
              className="absolute inset-0 pointer-events-none opacity-5 z-0"
              style={{
                backgroundImage: `url(${cardPurpleWitchhouse})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}
          <motion.div
            className="relative z-10 text-center max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {isHalloweenMode ? (
              <motion.img
                src={ghostGenie}
                alt=""
                className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 opacity-80"
                style={{
                  filter: "drop-shadow(0 0 30px rgba(96, 201, 182, 0.5))",
                }}
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ) : (
              <Folder
                className={`w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 ${isDark ? "text-[#71717A]" : "text-gray-300"}`}
              />
            )}
            <h3
              className={`text-xl md:text-2xl font-bold mb-3 ${isHalloweenMode ? "text-[#60c9b6] font-creepster tracking-wide" : isDark ? "text-white" : "text-gray-900"}`}
            >
              {isHalloweenMode ? "No Rituals Found" : "No Projects Found"}
            </h3>
            <p
              className={`text-sm md:text-base ${isHalloweenMode ? "text-[#60c9b6]/70" : isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
            >
              {isHalloweenMode
                ? "Your project graveyard is empty. Create tasks with project names to organize your spectral entries."
                : "Create some tasks with project names to see them organized here."}
            </p>
          </motion.div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="secondary" className="overflow-hidden relative">
      {isHalloweenMode && (
        <div
          className="absolute inset-0 pointer-events-none opacity-10 z-0"
          style={{
            backgroundImage: `url(${cardPurpleWitchhouse})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "grayscale(100%)",
          }}
        />
      )}
      {isHalloweenMode && (
        <>
          <motion.img
            src={witchFly}
            alt="Witch"
            className="absolute top-10 right-10 w-24 h-24 opacity-20 pointer-events-none z-0"
            animate={{
              x: [0, -100, 0],
              y: [0, 20, 0],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.img
            src={witchTakeoff}
            alt="Witch"
            className="absolute bottom-20 left-20 w-20 h-20 opacity-20 pointer-events-none z-0"
            animate={{
              y: [0, -40, 0],
              x: [0, 20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </>
      )}
      {/* Search and Filters Bar */}
      <div className="space-y-4 p-4 md:p-6 border-b border-[rgba(255,255,255,0.1)] relative z-10">
        {/* Main container for search and filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
          {/* Search Input (takes up available space) */}
          <div className="relative flex-1">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-[#71717A]"
                    : "text-gray-500"
              }`}
            />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none transition-colors text-sm ${
                isHalloweenMode
                  ? "bg-[#1a1a1f] border border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:ring-1 focus:ring-[#60c9b6]"
                  : isDark
                    ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A] focus:border-[#8B5CF6]"
                    : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8B5CF6]"
              }`}
            />
          </div>

          {/* Filters and Sort Controls - Side by Side on Mobile, Separate on Desktop */}
          <div className="flex gap-3 lg:gap-3 lg:shrink-0">
            {/* Sort Dropdown - Takes 2/3 on mobile */}
            <div className="flex-2 lg:w-48 lg:flex-none">
              <Dropdown
                value={sortBy}
                onValueChange={(value) =>
                  setSortBy(value as "name" | "tasks" | "completion")
                }
                placeholder="Sort by..."
                options={[
                  { value: "name", label: "Sort by Name" },
                  { value: "tasks", label: "Sort by Tasks" },
                  { value: "completion", label: "Sort by Progress" },
                ]}
              />
            </div>

            {/* Archive Toggle - Takes 1/3 on mobile */}
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-lg border transition-colors whitespace-nowrap cursor-pointer flex-1 lg:flex-none lg:px-4 lg:space-x-2 ${
                showArchived
                  ? isHalloweenMode
                    ? "bg-[#60c9b6]/20 border-[#60c9b6]/30 text-[#60c9b6]"
                    : "bg-[rgba(139,92,246,0.2)] border-[rgba(139,92,246,0.3)] text-[#8B5CF6]"
                  : isHalloweenMode
                    ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6]/70 hover:text-[#60c9b6] hover:border-[#60c9b6]/50"
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
          </div>
        </div>

        {/* Results count */}
        <div
          className={`text-xs md:text-sm ${
            isHalloweenMode
              ? "text-[#60c9b6]/70"
              : isDark
                ? "text-[#71717A]"
                : "text-gray-500"
          }`}
        >
          {filteredProjects.length}{" "}
          {filteredProjects.length === 1 ? "project" : "projects"} found
          {archivedProjects.length > 0 && !showArchived && (
            <span className="ml-2">• {archivedProjects.length} archived</span>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 && !showArchived ? (
        <div className="relative overflow-hidden rounded-xl min-h-[300px] flex items-center justify-center p-8">
          <motion.div
            className="relative z-10 text-center max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {isHalloweenMode ? (
              <motion.img
                src={ghostGenie}
                alt=""
                className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-5 opacity-80"
                style={{
                  filter: "drop-shadow(0 0 25px rgba(96, 201, 182, 0.5))",
                }}
                animate={{
                  y: [0, -8, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ) : (
              <Folder
                className={`w-20 h-20 md:w-24 md:h-24 mx-auto mb-5 ${isDark ? "text-[#71717A]" : "text-gray-300"}`}
              />
            )}
            <h3
              className={`text-lg md:text-xl font-bold mb-2 ${isHalloweenMode ? "text-[#60c9b6] font-creepster tracking-wide" : isDark ? "text-white" : "text-gray-900"}`}
            >
              {isHalloweenMode
                ? searchTerm
                  ? "No Matching Rituals"
                  : "No Rituals Found"
                : "No Projects Found"}
            </h3>
            <p
              className={`text-sm ${isHalloweenMode ? "text-[#60c9b6]/70" : isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
            >
              {searchTerm
                ? isHalloweenMode
                  ? "The spirits cannot find what you seek. Try different incantations."
                  : "Try adjusting your search terms."
                : isHalloweenMode
                  ? "Create tasks with project names to summon your rituals."
                  : "Create some tasks with project names to see them organized here."}
            </p>
          </motion.div>
        </div>
      ) : (
        <>
          {/* Active Projects Section */}
          {!showArchived && filteredProjects.length > 0 && (
            <div className="p-6 relative z-10">
              <h3
                className={`text-lg font-semibold mb-4 ${
                  isHalloweenMode
                    ? "text-[#60c9b6] font-creepster tracking-wide"
                    : isDark
                      ? "text-white"
                      : "text-gray-900"
                }`}
              >
                Active Projects ({filteredProjects.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.name}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 100,
                    }}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative"
                  >
                    <div
                      className={`relative rounded-xl p-4 transition-all duration-200 ${
                        isHalloweenMode
                          ? "bg-[#1a1a1f] border border-[#60c9b6]/30 hover:bg-[#60c9b6]/10 hover:border-[#60c9b6]/50 shadow-[0_0_10px_rgba(96,201,182,0.1)] hover:shadow-[0_0_15px_rgba(96,201,182,0.2)]"
                          : isDark
                            ? "bg-[rgba(26,26,31,0.6)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] hover:bg-[rgba(40,40,45,0.6)]"
                            : "bg-white border border-gray-200 hover:border-gray-300 shadow-xs hover:shadow-md"
                      }`}
                    >
                      {/* Three Dots Menu */}
                      <div className="absolute top-2 right-2 z-50">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(
                              openMenuId === project.name ? null : project.name,
                            );
                          }}
                          className={`p-1 border rounded-md transition-all duration-200 cursor-pointer ${
                            isHalloweenMode
                              ? "bg-[#1a1a1f] hover:bg-[#60c9b6]/20 border-[#60c9b6]/30 text-[#60c9b6]"
                              : isDark
                                ? "bg-[#2A2A2F] hover:bg-[#35353A] border-[rgba(255,255,255,0.1)]"
                                : "bg-white hover:bg-gray-50 shadow-xs border-gray-200"
                          }`}
                        >
                          <MoreHorizontal
                            className={`w-3 h-3 ${
                              isHalloweenMode
                                ? "text-[#60c9b6]"
                                : "text-[#8B5CF6]"
                            }`}
                          />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuId === project.name && (
                          <div
                            className={`absolute right-0 mt-1 w-18 rounded-md shadow-lg overflow-hidden z-50 ${
                              isHalloweenMode
                                ? "bg-[#1a1a1f] border border-[#60c9b6]/30 shadow-[0_0_15px_rgba(96,201,182,0.2)]"
                                : isDark
                                  ? "bg-[#2A2A2F] border border-[rgba(255,255,255,0.1)]"
                                  : "bg-white border border-gray-200"
                            }`}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(null);
                                if (isArchived(project.name)) {
                                  unarchiveProject(project.name);
                                } else {
                                  archiveProject(project.name);
                                }
                              }}
                              className={`w-full px-2 py-1.5 text-left text-[10px] flex items-center space-x-1.5 transition-colors ${
                                isArchived(project.name)
                                  ? "text-[#10B981] hover:bg-[rgba(255,255,255,0.05)]"
                                  : "text-[#F59E0B] hover:bg-[rgba(255,255,255,0.05)]"
                              }`}
                            >
                              {isArchived(project.name) ? (
                                <>
                                  <ArchiveRestore className="w-3 h-3" />
                                  <span>Unarchive</span>
                                </>
                              ) : (
                                <>
                                  <Archive className="w-3 h-3" />
                                  <span>Archive</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      <div
                        className="relative flex flex-col items-center space-y-3 cursor-pointer"
                        onClick={() => onProjectClick(project.name)}
                      >
                        {/* Folder Icon */}
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-105 ${
                            isHalloweenMode
                              ? "bg-[#60c9b6]/10 border border-[#60c9b6]/30"
                              : isDark
                                ? "bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)]"
                                : "bg-purple-100 border border-purple-200"
                          }`}
                        >
                          <Folder
                            className={`w-6 h-6 ${
                              isHalloweenMode
                                ? "text-[#60c9b6]"
                                : "text-[#8B5CF6]"
                            }`}
                          />
                        </div>

                        {/* Project Name */}
                        <div className="text-center w-full">
                          <h3
                            className={`text-sm font-medium truncate max-w-[80px] mx-auto transition-all duration-200 ${
                              isHalloweenMode
                                ? "text-[#60c9b6] font-creepster tracking-wide group-hover:text-[#4db8a5]"
                                : "text-[#8B5CF6] group-hover:text-[#7C3AED]"
                            }`}
                          >
                            {project.name}
                          </h3>
                          <p
                            className={`text-xs mt-1 ${isDark ? "text-[#71717A]" : "text-gray-500"}`}
                          >
                            {project.taskCount}{" "}
                            {project.taskCount === 1 ? "task" : "tasks"}
                          </p>
                        </div>

                        {/* Stats Row - Hidden on mobile */}
                        <div
                          className={`hidden md:flex items-center justify-center gap-4 w-full py-2 px-3 rounded-lg ${
                            isDark
                              ? "bg-[rgba(255,255,255,0.03)]"
                              : "bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center space-x-1.5">
                            <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                            <span className="text-xs font-semibold text-[#10B981]">
                              {project.completedCount}
                            </span>
                          </div>
                          <div
                            className={`w-px h-3 ${isDark ? "bg-[rgba(255,255,255,0.1)]" : "bg-gray-300"}`}
                          ></div>
                          <div className="flex items-center space-x-1.5">
                            <div className="w-2 h-2 bg-[#F59E0B] rounded-full"></div>
                            <span className="text-xs font-semibold text-[#F59E0B]">
                              {project.pendingCount}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar - Hidden on mobile */}
                        <div className="hidden md:block w-full space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-medium ${
                                isHalloweenMode
                                  ? "text-[#60c9b6]/70"
                                  : isDark
                                    ? "text-[#B4B4B8]"
                                    : "text-gray-600"
                              }`}
                            >
                              Progress
                            </span>
                            <span
                              className={`text-xs font-bold ${
                                project.completionRate === 100
                                  ? "text-[#10B981]"
                                  : isHalloweenMode
                                    ? "text-[#60c9b6]"
                                    : "text-[#8B5CF6]"
                              }`}
                            >
                              {project.completionRate}%
                            </span>
                          </div>
                          <div
                            className={`h-2 rounded-full overflow-hidden ${
                              isHalloweenMode
                                ? "bg-[#60c9b6]/10"
                                : isDark
                                  ? "bg-[rgba(255,255,255,0.08)]"
                                  : "bg-gray-200"
                            }`}
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${project.completionRate}%` }}
                              transition={{
                                duration: 0.8,
                                delay: index * 0.05 + 0.2,
                              }}
                              className={`h-full rounded-full ${
                                project.completionRate === 100
                                  ? "bg-[#10B981]"
                                  : isHalloweenMode
                                    ? "bg-[#60c9b6]"
                                    : "bg-[#8B5CF6]"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Show Archived Button */}
          {archivedProjects.length > 0 && !showArchived && (
            <div className="p-6 border-t border-[rgba(255,255,255,0.1)] relative z-10">
              <motion.button
                onClick={() => setShowArchived(true)}
                className={`w-full px-4 py-2.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-center space-x-2 ${
                  isHalloweenMode
                    ? "bg-[#60c9b6]/10 border border-[#60c9b6]/30 text-[#60c9b6] hover:bg-[#60c9b6]/20"
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

          {/* Archived Projects Section */}
          {showArchived && archivedProjects.length > 0 && (
            <div className="p-6 border-t border-[rgba(255,255,255,0.1)] relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`text-lg font-semibold ${
                    isHalloweenMode
                      ? "text-[#60c9b6] font-creepster tracking-wide"
                      : isDark
                        ? "text-white"
                        : "text-gray-900"
                  }`}
                >
                  Archived Projects ({archivedProjects.length})
                </h3>
                <motion.button
                  onClick={() => setShowArchived(false)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                    isHalloweenMode
                      ? "bg-[#60c9b6]/20 border border-[#60c9b6]/30 text-[#60c9b6] hover:bg-[#60c9b6]/30"
                      : "bg-[rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.3)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.3)]"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Hide
                </motion.button>
              </div>
              {filteredProjects.length === 0 ? (
                <div className="py-8 text-center">
                  <Folder
                    className={`w-12 h-12 mx-auto mb-3 ${isDark ? "text-[#71717A]" : "text-gray-400"}`}
                  />
                  <p
                    className={`text-sm ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                  >
                    {searchTerm
                      ? "No archived projects match your search."
                      : "You haven't archived any projects yet."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 opacity-60">
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.name}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 100,
                      }}
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative"
                    >
                      <div
                        className={`relative rounded-xl p-4 transition-all duration-200 ${
                          isHalloweenMode
                            ? "bg-[#1a1a1f] border border-[#60c9b6]/30 hover:bg-[#60c9b6]/10 hover:border-[#60c9b6]/50 shadow-[0_0_10px_rgba(96,201,182,0.1)] hover:shadow-[0_0_15px_rgba(96,201,182,0.2)]"
                            : isDark
                              ? "bg-[rgba(26,26,31,0.6)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] hover:bg-[rgba(40,40,45,0.6)]"
                              : "bg-white border border-gray-200 hover:border-gray-300 shadow-xs hover:shadow-md"
                        }`}
                      >
                        {/* Three Dots Menu */}
                        <div className="absolute top-2 right-2 z-50">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(
                                openMenuId === project.name
                                  ? null
                                  : project.name,
                              );
                            }}
                            className={`p-1 border rounded-md transition-all duration-200 cursor-pointer ${
                              isDark
                                ? "bg-[#2A2A2F] hover:bg-[#35353A] border-[rgba(255,255,255,0.1)]"
                                : "bg-white hover:bg-gray-50 shadow-xs border-gray-200"
                            }`}
                          >
                            <MoreHorizontal className="w-3 h-3 text-[#8B5CF6]" />
                          </button>

                          {/* Dropdown Menu */}
                          {openMenuId === project.name && (
                            <div
                              className={`absolute right-0 mt-1 w-20 rounded-md shadow-lg overflow-hidden z-50 ${
                                isDark
                                  ? "bg-[#2A2A2F] border border-[rgba(255,255,255,0.1)]"
                                  : "bg-white border border-gray-200"
                              }`}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  unarchiveProject(project.name);
                                }}
                                className="w-full px-2 py-1.5 text-left text-[10px] flex items-center space-x-1.5 transition-colors text-[#10B981] hover:bg-[rgba(255,255,255,0.05)]"
                              >
                                <ArchiveRestore className="w-3 h-3" />
                                <span>Unarchive</span>
                              </button>
                            </div>
                          )}
                        </div>

                        <div
                          className="relative flex flex-col items-center space-y-3 cursor-pointer"
                          onClick={() => onProjectClick(project.name)}
                        >
                          {/* Folder Icon */}
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-105 ${
                              isHalloweenMode
                                ? "bg-[#60c9b6]/10 border border-[#60c9b6]/30"
                                : isDark
                                  ? "bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)]"
                                  : "bg-purple-100 border border-purple-200"
                            }`}
                          >
                            <Folder
                              className={`w-6 h-6 ${
                                isHalloweenMode
                                  ? "text-[#60c9b6]"
                                  : "text-[#8B5CF6]"
                              }`}
                            />
                          </div>

                          {/* Project Name */}
                          <div className="text-center w-full">
                            <h3
                              className={`text-sm font-medium truncate max-w-[80px] mx-auto transition-all duration-200 ${
                                isHalloweenMode
                                  ? "text-[#60c9b6] font-creepster tracking-wide group-hover:text-[#4db8a5]"
                                  : "text-[#8B5CF6] group-hover:text-[#7C3AED]"
                              }`}
                            >
                              {project.name}
                            </h3>
                            <p
                              className={`text-xs mt-1 ${
                                isHalloweenMode
                                  ? "text-[#60c9b6]/70"
                                  : isDark
                                    ? "text-[#71717A]"
                                    : "text-gray-500"
                              }`}
                            >
                              {project.taskCount}{" "}
                              {project.taskCount === 1 ? "task" : "tasks"}
                            </p>
                          </div>

                          {/* Stats Row - Hidden on mobile */}
                          <div
                            className={`hidden md:flex items-center justify-center gap-4 w-full py-2 px-3 rounded-lg ${
                              isDark
                                ? "bg-[rgba(255,255,255,0.03)]"
                                : "bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center space-x-1.5">
                              <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                              <span className="text-xs font-semibold text-[#10B981]">
                                {project.completedCount}
                              </span>
                            </div>
                            <div
                              className={`w-px h-3 ${isDark ? "bg-[rgba(255,255,255,0.1)]" : "bg-gray-300"}`}
                            ></div>
                            <div className="flex items-center space-x-1.5">
                              <div className="w-2 h-2 bg-[#F59E0B] rounded-full"></div>
                              <span className="text-xs font-semibold text-[#F59E0B]">
                                {project.pendingCount}
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar - Hidden on mobile */}
                          <div className="hidden md:block w-full space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs font-medium ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                              >
                                Progress
                              </span>
                              <span
                                className={`text-xs font-bold ${
                                  project.completionRate === 100
                                    ? "text-[#10B981]"
                                    : isHalloweenMode
                                      ? "text-[#60c9b6]"
                                      : "text-[#8B5CF6]"
                                }`}
                              >
                                {project.completionRate}%
                              </span>
                            </div>
                            <div
                              className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-[rgba(255,255,255,0.08)]" : "bg-gray-200"}`}
                            >
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${project.completionRate}%`,
                                }}
                                transition={{
                                  duration: 0.8,
                                  delay: index * 0.05 + 0.2,
                                }}
                                className={`h-full rounded-full ${
                                  project.completionRate === 100
                                    ? "bg-[#10B981]"
                                    : isHalloweenMode
                                      ? "bg-[#60c9b6]"
                                      : "bg-[#8B5CF6]"
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </GlassCard>
  );
};
