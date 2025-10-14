import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  Tag,
  Wallet,
  ArrowUpDown,
  MoreHorizontal,
  AlertCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import Layout from './Layout'
import { AnimatedCard, AnimatedCardHeader, AnimatedCardContent, AnimatedCardTitle } from './AnimatedCard'
import { LoadingSpinner, LoadingCard } from './LoadingSpinner'
import { Button } from './ui/button'
import { Input } from './ui/input'
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
import TransactionForm from './TransactionForm'
import { cn } from '../lib/utils'
import ApiService from '../services/api'
import useAuth from '../hooks/useAuth'
import Swal from 'sweetalert2'

const Despesas = () => {
  const { userData } = useAuth()
  const [transacoes, setTransacoes] = useState([])
  const [carteiras, setCarteiras] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [transacoesData, carteirasData, categoriasData] = await Promise.all([
        ApiService.getTransacoes(),
        ApiService.getCarteiras(),
        ApiService.getCategorias()
      ])
      
      setTransacoes(transacoesData || [])
      setCarteiras(carteirasData || [])
      setCategorias(categoriasData || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setError('Erro ao carregar dados. Verifique se o backend está rodando.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTransaction = async (transactionData) => {
    try {
      await ApiService.createTransacao(transactionData, userData?.id)
      await loadData()
      setIsFormOpen(false)
    } catch (error) {
      console.error('Erro ao criar transação:', error)
      throw error
    }
  }

  const handleUpdateTransaction = async (transactionData) => {
    try {
      await ApiService.updateTransacao(editingTransaction.id, transactionData)
      await loadData()
      setIsFormOpen(false)
      setEditingTransaction(null)
    } catch (error) {
      console.error('Erro ao atualizar transação:', error)
      throw error
    }
  }

  const handleDeleteTransaction = (transactionId) => {
    Swal.fire({
      title: 'Você tem certeza?',
      text: "Esta ação não poderá ser revertida!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'dark:bg-gray-800 dark:text-gray-200',
        title: 'dark:text-white',
        confirmButton: 'dark:focus:ring-blue-800',
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await ApiService.deleteTransacao(transactionId);
          
          setTransacoes(prevTransacoes => prevTransacoes.filter(t => t.id !== transactionId));

          Swal.fire({
            title: 'Excluído!',
            text: 'A transação foi removida com sucesso.',
            icon: 'success',
            customClass: {
              popup: 'dark:bg-gray-800 dark:text-gray-200',
              title: 'dark:text-white',
            }
          });

        } catch (error) {
          console.error("Erro ao excluir transação:", error);
          Swal.fire({
            title: 'Erro!',
            text: 'Não foi possível excluir a transação. Tente novamente.',
            icon: 'error',
            customClass: {
              popup: 'dark:bg-gray-800 dark:text-gray-200',
              title: 'dark:text-white',
            }
          });
        }
      }
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getTypeColor = (tipo) => {
    switch (tipo) {
      case 'RECEITA':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'DESPESA':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'TRANSFERENCIA':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getTypeIcon = (tipo) => {
    switch (tipo) {
      case 'RECEITA':
        return TrendingUp
      case 'DESPESA':
        return TrendingDown
      case 'TRANSFERENCIA':
        return Wallet
      default:
        return DollarSign
    }
  }

  const filteredAndSortedTransactions = transacoes
    .filter(transaction => {
      const matchesSearch = transaction.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterType === 'all' || transaction.tipo === filterType
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.data)
          bValue = new Date(b.data)
          break
        case 'value':
          aValue = a.valor
          bValue = b.valor
          break
        case 'description':
          aValue = a.descricao.toLowerCase()
          bValue = b.descricao.toLowerCase()
          break
        default:
          return 0
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const getTransactionSummary = () => {
    const receitas = transacoes.filter(t => t.tipo === 'RECEITA').reduce((sum, t) => sum + t.valor, 0)
    const despesas = transacoes.filter(t => t.tipo === 'DESPESA').reduce((sum, t) => sum + t.valor, 0)
    const saldo = receitas - despesas
    
    return { receitas, despesas, saldo, total: transacoes.length }
  }

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
          <LoadingCard />
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
              Erro ao carregar dados
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <Button onClick={loadData} className="bg-blue-600 hover:bg-blue-700">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  const summary = getTransactionSummary()

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
              Transações
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gerencie suas receitas, despesas e transferências
            </p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              setEditingTransaction(null)
              setIsFormOpen(true)
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedCard delay={0.1} className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <AnimatedCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Receitas</p>
                  <p className="text-2xl font-bold mt-1">
                    {formatCurrency(summary.receitas)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-100" />
              </div>
            </AnimatedCardContent>
          </AnimatedCard>

          <AnimatedCard delay={0.2} className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
            <AnimatedCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Despesas</p>
                  <p className="text-2xl font-bold mt-1">
                    {formatCurrency(summary.despesas)}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-100" />
              </div>
            </AnimatedCardContent>
          </AnimatedCard>

          <AnimatedCard delay={0.3} className={cn(
            "border-0 text-white",
            summary.saldo >= 0 
              ? "bg-gradient-to-r from-blue-500 to-blue-600" 
              : "bg-gradient-to-r from-orange-500 to-orange-600"
          )}>
            <AnimatedCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Saldo</p>
                  <p className="text-2xl font-bold mt-1">
                    {formatCurrency(summary.saldo)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-100" />
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </div>

        {/* Filters and Search */}
        <AnimatedCard delay={0.4}>
          <AnimatedCardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar transações..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filtrar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilterType('all')}>
                      Todas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType('RECEITA')}>
                      Receitas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType('DESPESA')}>
                      Despesas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType('TRANSFERENCIA')}>
                      Transferências
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <ArrowUpDown className="w-4 h-4" />
                      Ordenar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => { setSortBy('date'); setSortOrder('desc') }}>
                      Data (Mais recente)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy('date'); setSortOrder('asc') }}>
                      Data (Mais antiga)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy('value'); setSortOrder('desc') }}>
                      Valor (Maior)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy('value'); setSortOrder('asc') }}>
                      Valor (Menor)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy('description'); setSortOrder('asc') }}>
                      Descrição (A-Z)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>

        {/* Transactions List */}
        <AnimatedCard delay={0.5}>
          <AnimatedCardHeader>
            <AnimatedCardTitle>
              Transações ({filteredAndSortedTransactions.length})
            </AnimatedCardTitle>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            {filteredAndSortedTransactions.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {transacoes.length === 0 ? 'Nenhuma transação encontrada' : 'Nenhuma transação corresponde aos filtros'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {transacoes.length === 0 
                    ? 'Crie sua primeira transação para começar a controlar suas finanças'
                    : 'Tente ajustar os filtros ou termos de busca'
                  }
                </p>
                {transacoes.length === 0 && (
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setEditingTransaction(null)
                      setIsFormOpen(true)
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeira Transação
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredAndSortedTransactions.map((transacao, index) => {
                    const TypeIcon = getTypeIcon(transacao.tipo)
                    
                    return (
                      <motion.div
                        key={transacao.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center",
                            transacao.tipo === 'RECEITA' ? 'bg-green-100 dark:bg-green-900' :
                            transacao.tipo === 'DESPESA' ? 'bg-red-100 dark:bg-red-900' :
                            'bg-blue-100 dark:bg-blue-900'
                          )}>
                            <TypeIcon className={cn(
                              "w-6 h-6",
                              transacao.tipo === 'RECEITA' ? 'text-green-600 dark:text-green-400' :
                              transacao.tipo === 'DESPESA' ? 'text-red-600 dark:text-red-400' :
                              'text-blue-600 dark:text-blue-400'
                            )} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {transacao.descricao}
                              </h3>
                              <Badge className={getTypeColor(transacao.tipo)}>
                                {transacao.tipo}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(transacao.data)}
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Wallet className="w-4 h-4" />
                                {transacao.carteiraOrigemNome || 'Carteira'}
                                {transacao.carteiraDestinoNome && (
                                  <span> → {transacao.carteiraDestinoNome}</span>
                                )}
                              </div>
                              
                              {transacao.categoriaNome && (
                                <div className="flex items-center gap-1">
                                  <Tag className="w-4 h-4" />
                                  {transacao.categoriaNome}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={cn(
                              "text-lg font-bold",
                              transacao.tipo === 'RECEITA' ? 'text-green-600 dark:text-green-400' :
                              transacao.tipo === 'DESPESA' ? 'text-red-600 dark:text-red-400' :
                              'text-blue-600 dark:text-blue-400'
                            )}>
                              {transacao.tipo === 'RECEITA' ? '+' : transacao.tipo === 'DESPESA' ? '-' : ''}
                              {formatCurrency(transacao.valor)}
                            </p>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => {
                                setEditingTransaction(transacao)
                                setIsFormOpen(true)
                              }}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteTransaction(transacao.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </AnimatedCardContent>
        </AnimatedCard>

        {/* Transaction Form */}
        <TransactionForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false)
            setEditingTransaction(null)
          }}
          transaction={editingTransaction}
          carteiras={carteiras}
          categorias={categorias}
          onSubmit={editingTransaction ? handleUpdateTransaction : handleCreateTransaction}
        />
      </div>
    </Layout>
  )
}

export default Despesas
