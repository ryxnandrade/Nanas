import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

const AnimatedCard = ({ 
  children, 
  className, 
  hover = true, 
  delay = 0,
  ...props 
}) => {
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  const hoverVariants = {
    hover: {
      y: -4,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={hover ? "hover" : undefined}
      {...(hover && { variants: { ...cardVariants, ...hoverVariants } })}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700",
        "transition-shadow duration-200",
        hover && "hover:shadow-lg hover:shadow-blue-500/10",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}

const AnimatedCardHeader = ({ children, className }) => {
  return (
    <div className={cn("p-6 pb-4", className)}>
      {children}
    </div>
  )
}

const AnimatedCardContent = ({ children, className }) => {
  return (
    <div className={cn("px-6 pb-6", className)}>
      {children}
    </div>
  )
}

const AnimatedCardTitle = ({ children, className }) => {
  return (
    <h3 className={cn("text-lg font-semibold text-gray-900 dark:text-white", className)}>
      {children}
    </h3>
  )
}

const AnimatedCardDescription = ({ children, className }) => {
  return (
    <p className={cn("text-sm text-gray-600 dark:text-gray-400 mt-1", className)}>
      {children}
    </p>
  )
}

export {
  AnimatedCard,
  AnimatedCardHeader,
  AnimatedCardContent,
  AnimatedCardTitle,
  AnimatedCardDescription
}
