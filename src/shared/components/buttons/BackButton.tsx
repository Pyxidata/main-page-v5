import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function BackButton({
  path = null,
  onClick = () => {},
} : {
  path?: string | null,
  onClick?: () => void,
}) {
  const navigate = useNavigate();

  const baseOffset = "50%";

  const leftBracketVariants = {
    initial: {
      x: 0,
      opacity: 1,
    },
    hover: {
      x: -20,
      transition: {
        ease: "easeInOut",
        duration: 0.3,
      },
    },
  };

  const firstArrowVariants = {
    initial: {
      x: 0,
      opacity: 1,
    },
    hover: {
      x: -28,
      opacity: 0,
      transition: {
        ease: "easeInOut",
        duration: 0.2,
        delay: 0.1,
      },
    },
  };

  const secondArrowVariants = {
    initial: {
      x: 0,
      opacity: 1,
    },
    hover: {
      x: -28,
      transition: {
        ease: "easeInOut",
        duration: 0.3,
        delay: 0.2,
      },
    },
  };

  const newArrowVariants = {
    initial: {
      x: 36,
      opacity: 0,
    },
    hover: {
      x: 0,
      opacity: 1,
      transition: {
        ease: "easeInOut",
        duration: 0.3,
        delay: 0.3,
      },
    },
  };

  const rightBracketVariants = {
    initial: {
      x: 0,
      opacity: 1,
    },
    hover: {
      x: 20,
      transition: {
        ease: "easeInOut",
        duration: 0.3,
      },
    },
  };

  return (
    <motion.button
      className="w-32 h-10 text-4xl text-white/70 flex items-center justify-center opacity-30 hover:opacity-100 transition duration-500 scale-50 sm:scale-100"
      onClick={() => path ? navigate(path) : onClick()}
      whileHover="hover"
      whileTap="hover"
      onMouseLeave={(e) => {
        e.currentTarget.blur();
      }}
      initial="initial"
      animate="initial"
    >
      <motion.span
        variants={leftBracketVariants}
        style={{ position: "absolute", left: `calc(${baseOffset} - 1.5em)` }}
      >
        {"["}
      </motion.span>

      <motion.span
        variants={firstArrowVariants}
        style={{ position: "absolute", left: `calc(${baseOffset} - 0.75em)` }}
      >
        {"<"}
      </motion.span>

      <motion.span
        variants={secondArrowVariants}
        style={{ position: "absolute", left: `calc(${baseOffset})` }}
      >
        {"<"}
      </motion.span>

      <motion.span
        variants={newArrowVariants}
        style={{ position: "absolute", left: `calc(${baseOffset})` }}
      >
        {"<"}
      </motion.span>

      <motion.span
        variants={rightBracketVariants}
        style={{ position: "absolute", left: `calc(${baseOffset} + 0.75em)` }}
      >
        {"]"}
      </motion.span>
    </motion.button>
  );
}