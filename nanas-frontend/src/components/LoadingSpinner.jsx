import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

const LoadingSpinner = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <motion.div
        className={cn(
          "border-2 border-gray-200 border-t-blue-500 rounded-full",
          sizeClasses[size]
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  )
}

const LoadingCard = ({ className }) => {
  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm", className)}>
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  )
}

const LoadingButton = ({ children, isLoading, ...props }) => {
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={cn(
        "relative",
        props.className
      )}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" />
        </div>
      )}
      <span className={cn(isLoading && "opacity-0")}>
        {children}
      </span>
    </button>
  )
}

export { LoadingSpinner, LoadingCard, LoadingButton }
