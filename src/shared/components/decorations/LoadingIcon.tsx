import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingIcon({
  loop = true
} : {
  loop?: boolean
}) {
  return (
    <motion.div 
      className='absolute border-2 sm:border-4 border-white/50 w-[150px] h-[150px] sm:w-[300px] sm:h-[300px] flex flex-col p-2'
      animate={{
        rotateZ: [0, 765],
      }}
      transition={{
        duration: 2,
        ease: [0.1, 1, 0.9, 1],
        times: [0, 1],
        repeat: loop ? Infinity : 0,
      }}
    >      
    </motion.div>
  );
}