import { motion } from "framer-motion";
import { Home, PanelRightClose } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button.tsx";
import { useAuth } from "@/contexts/AuthContext";

interface NavFeature {
  name: string;
  icon: React.ElementType;
  color: string;
}

interface MobileMenuProps {
  isDark: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  navFeatures: NavFeature[];
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isDark,
  mobileMenuOpen,
  setMobileMenuOpen,
  navFeatures,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleScrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const elementPosition =
          element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition =
          elementPosition - window.innerHeight / 2 + element.offsetHeight / 2;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }, 300);
  };

  return (
    <>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: mobileMenuOpen ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed top-0 right-0 bottom-0 w-[260px] z-50 lg:hidden flex flex-col ${
          isDark
            ? "bg-[rgba(20,20,25,0.85)] border-l-[rgba(255,255,255,0.1)]"
            : "bg-[rgba(250,250,252,0.85)] border-l-slate-200"
        } backdrop-blur-xl border-l rounded-l-2xl p-3`}
      >
        {/* Mobile Menu Header */}
        <div
          className={`p-3 mb-2 pb-3 border-b ${
            isDark ? "border-[rgba(255,255,255,0.1)]" : "border-slate-200"
          }`}
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <motion.div className="bg-linear-to-br from-[#8B5CF6] to-[#7C3AED] h-8 w-8 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-base font-['Outfit']">
                IG
              </span>
            </motion.div>
            <h1 className="text-xl font-semibold tracking-tight font-['Outfit'] text-purple-600">
              Integral
            </h1>
          </button>
        </div>

        {/* Mobile Menu Content */}
        <nav className="grow px-2 space-y-1.5 overflow-y-auto scrollbar-hide">
          {navFeatures
            .filter((feature) => feature.name !== "Lovable")
            .map((feature) => {
              const sectionId = "features-in-action";

              return (
                <a
                  key={feature.name}
                  href={`#${sectionId}`}
                  onClick={(e) => handleScrollToSection(e, sectionId)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-base ${
                    isDark
                      ? "text-slate-300 hover:text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.1)]"
                      : "text-slate-600 hover:text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.1)]"
                  }`}
                >
                  <feature.icon
                    className="w-5 h-5 mr-3 transition-colors"
                    style={{ color: feature.color }}
                  />
                  <span>{feature.name}</span>
                </a>
              );
            })}
        </nav>

        {/* Mobile Menu Footer */}
        <div
          className={`px-2 py-3 border-t ${
            isDark ? "border-[rgba(255,255,255,0.1)]" : "border-slate-200"
          }`}
        >
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
              className={`h-11 w-11 rounded-xl ${
                isDark
                  ? "bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <PanelRightClose className="h-5 w-5" />
            </Button>
            <button
              onClick={() => {
                navigate(user ? "/dashboard" : "/auth");
                setMobileMenuOpen(false);
              }}
              className={`flex-1 flex items-center justify-center px-3 py-2.5 rounded-xl transition-colors text-base font-medium ${
                user
                  ? isDark
                    ? "bg-[rgba(16,185,129,0.2)] text-[#10B981] hover:bg-[rgba(16,185,129,0.3)]"
                    : "bg-[rgba(16,185,129,0.1)] text-green-600 hover:bg-[rgba(16,185,129,0.2)]"
                  : isDark
                    ? "bg-[rgba(139,92,246,0.2)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.3)]"
                    : "bg-[rgba(139,92,246,0.1)] text-purple-600 hover:bg-[rgba(139,92,246,0.2)]"
              }`}
            >
              {user ? (
                <>
                  <Home className="w-5 h-5 mr-2" />
                  <span>Dashboard</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};
