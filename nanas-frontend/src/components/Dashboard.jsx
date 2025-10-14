import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  Activity,
  PieChart,
  BarChart3,
  AlertCircle
} from 'lucide-react'
import Layout from './Layout'
import { AnimatedCard, AnimatedCardHeader, AnimatedCardContent, AnimatedCardTitle, AnimatedCardDescription } from './AnimatedCard'
import { LoadingSpinner, LoadingCard } from './LoadingSpinner'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { cn } from '../lib/utils'
import ApiService from '../services/api'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState({
    saldoTotal: 0,
    receitas: 0,
    despesas: 0,
    transacoesRecentes: [],
    carteiras: [],
    categorias: []
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ApiService.getDashboardData()
      setDashboardData(data)
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
      setError('Erro ao carregar dados do dashboard. Verifique se o backend está rodando.')
    } finally {
      setLoading(false)
    }
  }

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

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
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
              Erro ao carregar dados
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <Button onClick={loadDashboardData} className="bg-blue-600 hover:bg-blue-700">
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
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Visão geral das suas finanças
            </p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => window.location.href = '/despesas'}
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
                  <p className="text-green-100 text-sm font-medium">Saldo Total</p>
                  <p className="text-3xl font-bold mt-1">
                    {formatCurrency(dashboardData.saldoTotal)}
                  </p>
                  <p className="text-green-100 text-sm mt-2">
                    {dashboardData.carteiras.length} carteira{dashboardData.carteiras.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-8 h-8" />
                </div>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>

          <AnimatedCard delay={0.2} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <AnimatedCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Receitas</p>
                  <p className="text-3xl font-bold mt-1">
                    {formatCurrency(dashboardData.receitas)}
                  </p>
                  <p className="text-blue-100 text-sm mt-2">
                    Este período
                  </p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <ArrowUpCircle className="w-8 h-8" />
                </div>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>

          <AnimatedCard delay={0.3} className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
            <AnimatedCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Despesas</p>
                  <p className="text-3xl font-bold mt-1">
                    {formatCurrency(dashboardData.despesas)}
                  </p>
                  <p className="text-red-100 text-sm mt-2">
                    Este período
                  </p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <ArrowDownCircle className="w-8 h-8" />
                </div>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <AnimatedCard delay={0.4}>
            <AnimatedCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <AnimatedCardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Transações Recentes
                  </AnimatedCardTitle>
                  <AnimatedCardDescription>
                    Suas últimas movimentações
                  </AnimatedCardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/despesas'}
                >
                  Ver Todas
                </Button>
              </div>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <div className="space-y-4">
                {dashboardData.transacoesRecentes.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Nenhuma transação encontrada
                    </p>
                    <Button 
                      className="mt-4"
                      onClick={() => window.location.href = '/despesas'}
                    >
                      Criar primeira transação
                    </Button>
                  </div>
                ) : (
                  dashboardData.transacoesRecentes.map((transacao, index) => (
                    <motion.div
                      key={transacao.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          transacao.tipo === 'RECEITA' ? 'bg-green-100 dark:bg-green-900' :
                          transacao.tipo === 'DESPESA' ? 'bg-red-100 dark:bg-red-900' :
                          'bg-blue-100 dark:bg-blue-900'
                        )}>
                          {transacao.tipo === 'RECEITA' ? (
                            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : transacao.tipo === 'DESPESA' ? (
                            <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                          ) : (
                            <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {transacao.descricao}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(transacao.data)} • {transacao.carteiraOrigemNome || 'Carteira'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "font-semibold",
                          transacao.tipo === 'RECEITA' ? 'text-green-600 dark:text-green-400' :
                          transacao.tipo === 'DESPESA' ? 'text-red-600 dark:text-red-400' :
                          'text-blue-600 dark:text-blue-400'
                        )}>
                          {transacao.tipo === 'RECEITA' ? '+' : transacao.tipo === 'DESPESA' ? '-' : ''}
                          {formatCurrency(transacao.valor)}
                        </p>
                        {transacao.categoriaNome && (
                          <Badge variant="secondary" className="text-xs">
                            {transacao.categoriaNome}
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </AnimatedCardContent>
          </AnimatedCard>

          {/* Wallets Overview */}
          <AnimatedCard delay={0.5}>
            <AnimatedCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <AnimatedCardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Carteiras
                  </AnimatedCardTitle>
                  <AnimatedCardDescription>
                    Saldos das suas contas
                  </AnimatedCardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/carteiras'}
                >
                  Gerenciar
                </Button>
              </div>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <div className="space-y-4">
                {dashboardData.carteiras.length === 0 ? (
                  <div className="text-center py-8">
                    <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Nenhuma carteira encontrada
                    </p>
                    <Button 
                      className="mt-4"
                      onClick={() => window.location.href = '/carteiras'}
                    >
                      Criar primeira carteira
                    </Button>
                  </div>
                ) : (
                  dashboardData.carteiras.map((carteira, index) => (
                    <motion.div
                      key={carteira.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          carteira.saldo >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                        )}>
                          <Wallet className={cn(
                            "w-5 h-5",
                            carteira.saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          )} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {carteira.nome}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {carteira.tipo}
                          </p>
                        </div>
                      </div>
                      <p className={cn(
                        "font-semibold",
                        carteira.saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      )}>
                        {formatCurrency(carteira.saldo)}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </AnimatedCardContent>
          </AnimatedCard>

          {/* Categories Overview */}
          <AnimatedCard delay={0.6}>
            <AnimatedCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <AnimatedCardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Categorias
                  </AnimatedCardTitle>
                  <AnimatedCardDescription>
                    Gastos por categoria
                  </AnimatedCardDescription>
                </div>
                <Button variant="outline" size="sm">
                  Ver Relatório
                </Button>
              </div>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <div className="space-y-4">
                {dashboardData.categorias.length === 0 ? (
                  <div className="text-center py-8">
                    <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Nenhuma categoria encontrada
                    </p>
                  </div>
                ) : (
                  dashboardData.categorias.map((categoria, index) => (
                    <motion.div
                      key={categoria.id || categoria.nome}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {categoria.nome}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {categoria.transacoes || 0} transação{(categoria.transacoes || 0) !== 1 ? 'ões' : ''}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(categoria.total || 0)}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </AnimatedCardContent>
          </AnimatedCard>

          {/* Quick Actions */}
          <AnimatedCard delay={0.7}>
            <AnimatedCardHeader>
              <AnimatedCardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Ações Rápidas
              </AnimatedCardTitle>
              <AnimatedCardDescription>
                Acesso rápido às principais funcionalidades
              </AnimatedCardDescription>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => window.location.href = '/despesas?tipo=receita'}
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-sm">Nova Receita</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => window.location.href = '/despesas?tipo=despesa'}
                >
                  <TrendingDown className="w-6 h-6" />
                  <span className="text-sm">Nova Despesa</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => window.location.href = '/carteiras'}
                >
                  <Wallet className="w-6 h-6" />
                  <span className="text-sm">Carteiras</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  <Calendar className="w-6 h-6" />
                  <span className="text-sm">Relatórios</span>
                </Button>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
