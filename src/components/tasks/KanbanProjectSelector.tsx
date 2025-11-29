import { motion } from "framer-motion";
import { Folder, Ghost, Kanban, Plus, Search } from "lucide-react";
import React, { useMemo, useState } from "react";
import {
  batGlide,
  batSwoop,
  cardHauntedHouse,
  ghostGenie,
  spiderCuteHanging,
} from "@/assets";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/contexts/ThemeContext";
import { useArchivedProjects } from "@/hooks/useArchivedProjects";
import { Project } from "@/hooks/useProjects";

import { Dropdown } from "@/components/ui/Dropdown";

interface KanbanProjectSelectorProps {
  projects: Project[];
  onProjectSelect: (projectName: string) => void;
}

export const KanbanProjectSelector: React.FC<KanbanProjectSelectorProps> = ({
  projects,
  onProjectSelect,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { isArchived } = useArchivedProjects();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "tasks" | "completion">("name");

  const availableProjects = useMemo(() => {
    const filtered = projects.filter(
      (project) =>
        project.name !== "Unassigned" &&
        !isArchived(project.name) &&
        project.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return filtered.sort((a, b) => {
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
  }, [projects, isArchived, searchTerm, sortBy]);

  if (projects.length === 0 || availableProjects.length === 0) {
    return (
      <GlassCard>
        <div className="relative overflow-hidden rounded-xl min-h-[400px] flex items-center justify-center p-8">
          {isHalloweenMode && (
            <>
              <div
                className="absolute inset-0 pointer-events-none opacity-5 z-0"
                style={{
                  backgroundImage: `url(${cardHauntedHouse})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <motion.img
                src={batSwoop}
                alt=""
                className="absolute top-10 right-10 w-16 opacity-10 pointer-events-none z-0"
                style={{
                  filter: "drop-shadow(0 0 20px rgba(96, 201, 182, 0.4))",
                }}
                animate={{
                  x: [0, -20, 0],
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </>
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
              <Kanban
                className={`w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 ${isDark ? "text-[#71717A]" : "text-gray-300"}`}
              />
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
              {isHalloweenMode
                ? searchTerm
                  ? "No Boards Found"
                  : "No Spirit Boards Yet"
                : "No Projects Available"}
            </h3>
            <p
              className={`text-sm md:text-base ${
                isHalloweenMode
                  ? "text-[#60c9b6]/70"
                  : isDark
                    ? "text-[#B4B4B8]"
                    : "text-gray-600"
              }`}
            >
              {searchTerm
                ? isHalloweenMode
                  ? "The spirits cannot find matching boards. Try different search terms."
                  : "No projects match your search."
                : isHalloweenMode
                  ? "Create tasks with project names to conjure your Kanban spirit boards."
                  : "Create tasks with project names to organize them on Kanban boards."}
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
          className="absolute inset-0 pointer-events-none opacity-5 z-0"
          style={{
            backgroundImage: `url(${cardHauntedHouse})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "grayscale(100%)",
          }}
        />
      )}
      {isHalloweenMode && (
        <>
          <motion.img
            src={spiderCuteHanging}
            alt="Spider"
            className="absolute top-0 left-10 w-16 h-16 opacity-20 pointer-events-none z-0"
            animate={{
              y: [0, 20, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.img
            src={batGlide}
            alt="Bat"
            className="absolute top-20 right-1/3 w-12 h-12 opacity-15 pointer-events-none z-0"
            animate={{
              x: [0, 100, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.img
            src={batSwoop}
            alt="Bat"
            className="absolute bottom-1/3 left-20 w-14 h-14 opacity-15 pointer-events-none z-0"
            animate={{
              x: [0, -50, 0],
              y: [0, -30, 0],
              rotate: [0, -10, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </>
      )}
      {/* Search Bar and Filters */}
      <div className="p-4 md:p-6 border-b border-[rgba(255,255,255,0.1)] space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
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
                    ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A] focus:border-[#EC4899]"
                    : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#EC4899]"
              }`}
            />
          </div>
          <div className="w-full md:w-48">
            <Dropdown
              value={sortBy}
              onValueChange={(value) =>
                setSortBy(value as "name" | "tasks" | "completion")
              }
              options={[
                { value: "name", label: "Sort by Name" },
                { value: "tasks", label: "Sort by Tasks" },
                { value: "completion", label: "Sort by Progress" },
              ]}
              placeholder="Sort by"
            />
          </div>
        </div>
        <div
          className={`text-xs md:text-sm ${
            isHalloweenMode
              ? "text-[#60c9b6]/70"
              : isDark
                ? "text-[#71717A]"
                : "text-gray-500"
          }`}
        >
          {availableProjects.length}{" "}
          {availableProjects.length === 1 ? "project" : "projects"} available
        </div>
      </div>

      {/* Projects Grid */}
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
          Select a Project Board
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {availableProjects.map((project, index) => (
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
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onProjectSelect(project.name)}
              className="group cursor-pointer"
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
                <div className="flex flex-col items-center space-y-3">
                  {/* Kanban Icon */}
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
                        isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]"
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
                    className={`hidden md:flex items-center justify-center gap-3 w-full py-2 px-3 rounded-lg ${
                      isDark ? "bg-[rgba(255,255,255,0.03)]" : "bg-gray-50"
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
    </GlassCard>
  );
};
