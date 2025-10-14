import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  X,
  LogOut,
  PiggyBank
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isDesktop = setIsOpen === undefined;

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
    },
    {
      title: 'Despesas',
      icon: Receipt,
      path: '/despesas',
    },
    {
      title: 'Carteiras',
      icon: Wallet,
      path: '/carteiras',
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Falha ao redirecionar após logout:", error);
      navigate('/login');
    }
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  const overlayVariants = {
    open: { opacity: 1, display: "block" },
    closed: { opacity: 0, transitionEnd: { display: "none" } }
  };

  const itemVariants = {
    open: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { opacity: 0, x: -20 }
  };

  return (
    <>
      <AnimatePresence>
        {!isDesktop && isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={isDesktop ? false : "closed"}
        animate={isDesktop ? "none" : (isOpen ? "open" : "closed")}
        variants={sidebarVariants}
        className={cn(
          "fixed left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 shadow-xl z-50",
          "lg:static lg:h-screen lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200 dark:lg:border-gray-700"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Nanas
              </h1>
            </div>
            {!isDesktop && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="lg:hidden"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>

          <div className="p-4 text-center border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Bem-vindo(a),</p>
            <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
              {user?.displayName || user?.email || 'Usuário'}
            </p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
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
                      "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      "group relative overflow-hidden",
                      isActive && "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    
                    <Icon 
                      className={cn(
                        "w-5 h-5 transition-colors duration-200",
                        isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400",
                        "group-hover:scale-110 transition-transform duration-200"
                      )} 
                    />
                    <span 
                      className={cn(
                        "font-medium transition-colors duration-200",
                        isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                      )}
                    >
                      {item.title}
                    </span>
                    
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      initial={false}
                    />
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <motion.div
              variants={itemVariants}
              initial={isDesktop ? false : "closed"}
              animate="open"
              transition={{ delay: 0.4 }}
            >
              <Button
                variant="ghost"
                className="w-full justify-start space-x-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
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
  );
};

export default Sidebar;
