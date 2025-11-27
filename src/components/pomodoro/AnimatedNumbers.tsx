import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const AnimatedCount = ({ value, padding = 1, duration = 0.8 }) => {
  const [displayValues, setDisplayValues] = useState(
    value.toString().padStart(padding, "0").split(""),
  );

  useEffect(() => {
    const debouncer = setTimeout(() => {
      if (value !== null) {
        setDisplayValues(value.toString().padStart(padding, "0").split(""));
      }
    }, 50);

    return () => clearTimeout(debouncer);
  }, [value, padding]);

  return (
    <AnimatePresence mode="popLayout">
      {displayValues.map((digit, i) => (
        <motion.span
          key={i + digit}
          className="inline-block tabular-nums"
          initial={{ y: 12, filter: "blur(12px)", opacity: 0 }}
          animate={{ y: 0, filter: "blur(0px)", opacity: 1 }}
          exit={{ y: -12, filter: "blur(12px)", opacity: 0 }}
          transition={{ type: "spring", bounce: 0.35, duration: duration }}
        >
          {digit}
        </motion.span>
      ))}
    </AnimatePresence>
  );
};

export default AnimatedCount;
