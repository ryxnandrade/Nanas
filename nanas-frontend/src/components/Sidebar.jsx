"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutDashboard, Receipt, Wallet, X, LogOut, PiggyBank, CreditCard, Target, Repeat, Lightbulb, FileText } from "lucide-react"
import { Button } from "./ui/button"
import { cn } from "../lib/utils"
import { useAuth } from "../hooks/useAuth"

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const isDesktop = setIsOpen === undefined

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      title: "Transações",
      icon: Receipt,
      path: "/despesas",
    },
    {
      title: "Carteiras",
      icon: Wallet,
      path: "/carteiras",
    },
    {
      title: "Cartão de Crédito",
      icon: CreditCard,
      path: "/cartao-credito",
    },
    {
      title: "Metas",
      icon: Target,
      path: "/metas",
    },
    {
      title: "Transações Recorrentes",
      icon: Repeat,
      path: "/transacoes-recorrentes",
    },
    {
      title: "Insights",
      icon: Lightbulb,
      path: "/insights",
    },
    {
      title: "Relatório Mensal",
      icon: FileText,
      path: "/relatorio-mensal",
    },
  ]

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Falha ao redirecionar após logout:", error)
      navigate("/login")
    }
  }

  const sidebarVariants = {
    open: {
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  }

  const overlayVariants = {
    open: { opacity: 1, display: "block" },
    closed: { opacity: 0, transitionEnd: { display: "none" } },
  }

  const itemVariants = {
    open: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { opacity: 0, x: -20 },
  }

  return (
    <>
      <AnimatePresence>
        {!isDesktop && isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={isDesktop ? false : "closed"}
        animate={isDesktop ? "none" : isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className={cn(
          "fixed left-0 top-0 h-full w-72 bg-sidebar shadow-2xl z-50",
          "lg:static lg:h-screen lg:translate-x-0 lg:shadow-none lg:border-r lg:border-sidebar-border",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sidebar-primary to-sidebar-accent rounded-xl flex items-center justify-center shadow-lg">
                <PiggyBank className="w-6 h-6 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-sidebar-foreground">Nanas</h1>
                <p className="text-xs text-sidebar-accent opacity-80">Finanças</p>
              </div>
            </div>
            {!isDesktop && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent/20"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="p-4 bg-sidebar-accent/10 rounded-lg border border-sidebar-accent/20">
              <p className="text-xs text-sidebar-accent opacity-70">Bem-vindo(a),</p>
              <p className="font-semibold text-sidebar-foreground truncate mt-1 text-sm">
                {user?.displayName || user?.email || "Usuário"}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <motion.div
                  key={item.path}
                  variants={itemVariants}
                  initial={isDesktop ? false : "closed"}
                  animate={isDesktop ? "open" : "open"}
                  transition={{ delay: isDesktop ? index * 0.05 : index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => !isDesktop && setIsOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300",
                      "relative overflow-hidden group",
                      isActive
                        ? "bg-gradient-to-r from-sidebar-primary to-sidebar-accent text-sidebar-primary-foreground shadow-lg"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/20",
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-sidebar-primary-foreground"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}

                    <Icon
                      className={cn(
                        "w-5 h-5 transition-all duration-300 flex-shrink-0",
                        isActive ? "scale-110" : "group-hover:scale-110",
                      )}
                    />
                    <span className="font-medium text-sm">{item.title}</span>

                    {!isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-sidebar-primary/10 to-sidebar-accent/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={false}
                      />
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <motion.div
              variants={itemVariants}
              initial={isDesktop ? false : "closed"}
              animate="open"
              transition={{ delay: 0.4 }}
            >
              <Button
                variant="ghost"
                className="w-full justify-start space-x-3 text-red-500 hover:text-red-600 hover:bg-red-50/10 dark:hover:bg-red-900/20 transition-all duration-300"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default Sidebar
