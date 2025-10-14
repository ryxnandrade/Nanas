import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Wallet, 
  CreditCard, 
  PiggyBank, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react'
import Layout from './Layout'
import { AnimatedCard, AnimatedCardHeader, AnimatedCardContent, AnimatedCardTitle, AnimatedCardDescription } from './AnimatedCard'
import { LoadingSpinner, LoadingCard } from './LoadingSpinner'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import WalletForm from './WalletForm'
import { cn } from '../lib/utils'
import ApiService from '../services/api'
import useAuth from '../hooks/useAuth'

const Carteiras = () => {
  const { userData } = useAuth()
  const [carteiras, setCarteiras] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showBalances, setShowBalances] = useState(true)
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingWallet, setEditingWallet] = useState(null)

  useEffect(() => {
    loadCarteiras()
  }, [])

  const loadCarteiras = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ApiService.getCarteiras()
      setCarteiras(data || [])
    } catch (error) {
      console.error('Erro ao carregar carteiras:', error)
      setError('Erro ao carregar carteiras. Verifique se o backend está rodando.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWallet = async (walletData) => {
    try {
      await ApiService.createCarteira(walletData, userData?.id)
      await loadCarteiras()
      setIsFormOpen(false)
    } catch (error) {
      console.error('Erro ao criar carteira:', error)
      throw error
    }
  }

  const handleUpdateWallet = async (walletData) => {
    try {
      await ApiService.updateCarteira(editingWallet.id, walletData)
      await loadCarteiras()
      setIsFormOpen(false)
      setEditingWallet(null)
    } catch (error) {
      console.error('Erro ao atualizar carteira:', error)
      throw error
    }
  }

  const handleDeleteWallet = async (walletId) => {
    if (!confirm('Tem certeza que deseja excluir esta carteira?')) {
      return
    }

    try {
      await ApiService.deleteCarteira(walletId)
      await loadCarteiras()
    } catch (error) {
      console.error('Erro ao excluir carteira:', error)
      alert('Erro ao excluir carteira. Tente novamente.')
    }
  }

  const formatCurrency = (value) => {
    if (!showBalances) return '••••••'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getWalletIcon = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'poupança':
      case 'poupanca':
        return PiggyBank
      case 'investimento':
        return TrendingUp
      case 'crédito':
      case 'credito':
        return CreditCard
      default:
        return Wallet
    }
  }

  const getColorClasses = (tipo, saldo) => {
    if (saldo < 0) {
      return {
        bg: 'bg-red-100 dark:bg-red-900',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800'
      }
    }
    
    const colors = {
      'corrente': {
        bg: 'bg-blue-100 dark:bg-blue-900',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800'
      },
      'poupança': {
        bg: 'bg-green-100 dark:bg-green-900',
        text: 'text-green-600 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800'
      },
      'poupanca': {
        bg: 'bg-green-100 dark:bg-green-900',
        text: 'text-green-600 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800'
      },
      'investimento': {
        bg: 'bg-purple-100 dark:bg-purple-900',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800'
      },
      'crédito': {
        bg: 'bg-orange-100 dark:bg-orange-900',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800'
      },
      'credito': {
        bg: 'bg-orange-100 dark:bg-orange-900',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800'
      }
    }
    
    return colors[tipo?.toLowerCase()] || colors.corrente
  }

  const getTotalBalance = () => {
    return carteiras.reduce((total, carteira) => total + (carteira.saldo || 0), 0)
  }

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Erro ao carregar carteiras
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <Button onClick={loadCarteiras} className="bg-blue-600 hover:bg-blue-700">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Carteiras
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gerencie suas contas e saldos
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBalances(!showBalances)}
              className="flex items-center gap-2"
            >
              {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showBalances ? 'Ocultar' : 'Mostrar'} Saldos
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setEditingWallet(null)
                setIsFormOpen(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Carteira
            </Button>
          </div>
        </motion.div>

        {/* Total Balance Card */}
        <AnimatedCard delay={0.1} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <AnimatedCardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Saldo Total</p>
                <p className="text-3xl font-bold mt-1">
                  {formatCurrency(getTotalBalance())}
                </p>
                <p className="text-blue-100 text-sm mt-2">
                  {carteiras.length} carteira{carteiras.length !== 1 ? 's' : ''} ativa{carteiras.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Wallet className="w-8 h-8" />
              </div>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>

        {/* Wallets Grid */}
        {carteiras.length === 0 ? (
          <AnimatedCard delay={0.2}>
            <AnimatedCardContent>
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Nenhuma carteira encontrada
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Crie sua primeira carteira para começar a gerenciar suas finanças
                </p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setEditingWallet(null)
                    setIsFormOpen(true)
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Carteira
                </Button>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {carteiras.map((carteira, index) => {
                const Icon = getWalletIcon(carteira.tipo)
                const colors = getColorClasses(carteira.tipo, carteira.saldo)
                
                return (
                  <motion.div
                    key={carteira.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AnimatedCard 
                      hover={true} 
                      delay={0}
                      className={cn("relative overflow-hidden", colors.border)}
                    >
                      <AnimatedCardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", colors.bg)}>
                              <Icon className={cn("w-6 h-6", colors.text)} />
                            </div>
                            <div>
                              <AnimatedCardTitle className="text-base">
                                {carteira.nome}
                              </AnimatedCardTitle>
                              <Badge variant="secondary" className="text-xs">
                                {carteira.tipo}
                              </Badge>
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => {
                                setSelectedWallet(carteira)
                                setIsDialogOpen(true)
                              }}>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setEditingWallet(carteira)
                                setIsFormOpen(true)
                              }}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteWallet(carteira.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </AnimatedCardHeader>
                      
                      <AnimatedCardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              Saldo Atual
                            </p>
                            <p className={cn(
                              "text-2xl font-bold",
                              (carteira.saldo || 0) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            )}>
                              {formatCurrency(carteira.saldo || 0)}
                            </p>
                          </div>
                          
                          {carteira.descricao && (
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {carteira.descricao}
                              </p>
                            </div>
                          )}
                        </div>
                      </AnimatedCardContent>
                      
                      {/* Gradient overlay */}
                      <div className={cn(
                        "absolute top-0 right-0 w-20 h-20 opacity-10",
                        colors.bg
                      )} style={{
                        background: `radial-gradient(circle at center, currentColor 0%, transparent 70%)`
                      }} />
                    </AnimatedCard>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Wallet Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Detalhes da Carteira: {selectedWallet?.nome}
              </DialogTitle>
              <DialogDescription>
                Visualize as informações desta carteira
              </DialogDescription>
            </DialogHeader>
            
            {selectedWallet && (
              <div className="space-y-6">
                {/* Wallet Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Tipo
                    </p>
                    <p className="text-lg font-semibold">
                      {selectedWallet.tipo}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Saldo Atual
                    </p>
                    <p className={cn(
                      "text-lg font-semibold",
                      (selectedWallet.saldo || 0) >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {formatCurrency(selectedWallet.saldo || 0)}
                    </p>
                  </div>
                </div>
                
                {selectedWallet.descricao && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Descrição
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {selectedWallet.descricao}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Wallet Form */}
        <WalletForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false)
            setEditingWallet(null)
          }}
          wallet={editingWallet}
          onSubmit={editingWallet ? handleUpdateWallet : handleCreateWallet}
        />
      </div>
    </Layout>
  )
}

export default Carteiras
