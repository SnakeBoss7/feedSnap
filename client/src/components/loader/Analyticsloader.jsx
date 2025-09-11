import { motion } from "framer-motion";

const AnalyticsLoader = ({ isVisible = true, message }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl"
        />
      </div>

      {/* Main loader container */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Morphing geometric loader */}
        <div className="relative h-16 w-16">
          {/* Outer rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary/60 border-r-primary/30"
          />

          {/* Inner morphing shapes */}
          <div className="absolute inset-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  rotate: [0, 120, 240, 360],
                  borderRadius: ["20%", "50%", "20%"],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: index * 0.3,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-70"
                style={{
                  clipPath: `polygon(50% 0%, ${100 - index * 20}% 100%, ${index * 20}% 100%)`,
                }}
              />
            ))}
          </div>

          {/* Center pulsing dot */}
          <motion.div
            animate={{
              scale: [0.5, 1, 0.5],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-lg shadow-primary/50"
          />

          {/* Orbiting particles */}
          {[0, 1, 2, 3].map((index) => (
            <motion.div
              key={`particle-${index}`}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 3 + index * 0.5,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0"
            >
              <motion.div
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut",
                }}
                className="absolute h-1 w-1 rounded-full bg-accent shadow-sm shadow-accent/50"
                style={{
                  top: `${20 + index * 15}%`,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Loading message */}
        {message && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-medium text-muted-foreground"
          >
            {message}
          </motion.p>
        )}

        {/* Animated dots */}
        <div className="flex gap-1">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={`dot-${index}`}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut",
              }}
              className="h-1 w-1 rounded-full bg-primary/60"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export { AnalyticsLoader};
export default AnalyticsLoader;