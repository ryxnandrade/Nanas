// NO SEU ARQUIVO Layout.js

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import { Button } from './ui/button'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        {/* Sidebar para Desktop */}
        <div className="hidden lg:block lg:w-72 lg:flex-shrink-0">
          <Sidebar />
        </div>
        
        {/* Sidebar para Mobile */}
        <div className="lg:hidden">
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 lg:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="w-6 h-6" />
              </Button>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Nanas
              </h1>
              <div className="w-10" />
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 lg:p-8 h-full"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout
