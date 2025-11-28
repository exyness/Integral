import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const colors = [
  "rgba(16, 185, 129, 1)",
  "rgba(139, 92, 246, 1)",
  "rgba(245, 158, 11, 1)",
  "rgba(59, 130, 246, 1)",
  "rgba(236, 72, 153, 1)",
];

export const Spinner = ({
  className,
  singleColor,
}: {
  className?: string;
  singleColor?: boolean;
}) => {
  const [colorIndex, setColorIndex] = useState(() =>
    Math.floor(Math.random() * colors.length),
  );

  useEffect(() => {
    if (singleColor) return;
    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % colors.length);
    }, 2700);

    return () => clearInterval(interval);
  }, [singleColor]);

  const activeColor = singleColor ? "#60c9b6" : colors[colorIndex];

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className || "min-h-screen bg-[#0A0A0B]"}`}
    >
      <motion.div
        className="relative flex items-center justify-start h-10 w-10"
        animate={{ rotate: 360 }}
        transition={{
          duration: 2.7,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {[...Array(6)].map((_, i) => {
          const delay = -1.5 * (0.835 - i * 0.167) * 0.5;
          return (
            <motion.div
              key={i}
              className="absolute top-0 left-0 flex items-start justify-center h-full w-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay,
              }}
            >
              <div
                className="h-[6.8px] w-[6.8px] rounded-full transition-colors duration-700"
                style={{ backgroundColor: activeColor }}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
