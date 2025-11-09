"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Menu } from "lucide-react"
import Sidebar from "./Sidebar"
import { Button } from "./ui/button"

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:w-72 lg:flex-shrink-0 bg-sidebar border-r border-sidebar-border">
          <Sidebar />
        </div>

        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <header className="bg-card/80 backdrop-blur-md shadow-md border-b border-border lg:hidden sticky top-0 z-40">
            <div className="flex items-center justify-between px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden hover:bg-accent/20"
              >
                <Menu className="w-6 h-6" />
              </Button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Nanas
              </h1>
              <div className="w-10" />
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 lg:p-8 min-h-full"
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
