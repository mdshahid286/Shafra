import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const AnimatedText = React.forwardRef(
  (
    {
      text,
      textClassName,
      underlineClassName,
      underlinePath = "M 0,15 Q 25,-10 50,15 Q 75,40 100,15 Q 125,-10 150,15 Q 175,40 200,15 Q 225,-10 250,15 Q 275,40 300,15",
      underlineHoverPath = "M 0,15 Q 25,40 50,15 Q 75,-10 100,15 Q 125,40 150,15 Q 175,-10 200,15 Q 225,40 250,15 Q 275,-10 300,15",
      underlineDuration = 1.5,
      ...props
    },
    ref
  ) => {
    const pathVariants = {
      hidden: {
        pathLength: 0,
        opacity: 0,
      },
      visible: {
        pathLength: 1,
        opacity: 1,
        transition: {
          duration: underlineDuration,
          ease: "easeInOut",
        },
      },
    };

    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center justify-center gap-2", props.className)}
      >
        <div className="relative">
          <motion.h1
            className={cn("text-4xl font-bold text-center", textClassName)}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            {text}
          </motion.h1>

          <motion.svg
            width="100%"
            height="20"
            viewBox="0 0 300 20"
            className={cn("absolute -bottom-2 left-0", underlineClassName)}
          >
            <motion.path
              d={underlinePath}
              stroke="currentColor"
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
              variants={pathVariants}
              initial="hidden"
              animate="visible"
              whileHover={{
                d: underlineHoverPath,
                transition: { duration: 0.8 },
              }}
            />
          </motion.svg>
        </div>
      </div>
    );
  }
);

AnimatedText.displayName = "AnimatedText";

export { AnimatedText };
