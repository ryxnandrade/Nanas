"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Wallet,
  Calendar,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  BarChart3,
  AlertCircle,
  CreditCard,
  Zap,
} from "lucide-react"
import Layout from "./Layout"
import {
  AnimatedCard,
  AnimatedCardHeader,
  AnimatedCardContent,
  AnimatedCardTitle,
  AnimatedCardDescription,
} from "./AnimatedCard"
import { LoadingCard } from "./LoadingSpinner"
import { Button } from "./ui/button"
import { cn } from "../lib/utils"
import ApiService from "../services/api"
import { useAuth } from "../hooks/useAuth"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { ChartContainer, ChartTooltipContent } from "./ui/chart"
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const Dashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState({
    saldoTotal: 0,
    receitas: 0,
    despesas: 0,
    cartoes: 0,
    receitasMesAnterior: 0,
    despesasMesAnterior: 0,
  })
  const [despesasPorCategoria, setDespesasPorCategoria] = useState([])
  const [evolucaoSaldo, setEvolucaoSaldo] = useState([])
  const [carteiras, setCarteiras] = useState([])
  const [selectedWallet, setSelectedWallet] = useState("all")

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [summaryData, despesasData, evolucaoData, carteirasData] = await Promise.all([
        ApiService.getDashboardSummary(),
        ApiService.getDespesasPorCategoria(),
        ApiService.getEvolucaoSaldo(),
        ApiService.getCarteiras(),
      ])

      setSummary(summaryData)
      setDespesasPorCategoria(despesasData)
      setEvolucaoSaldo(evolucaoData)
      setCarteiras(carteirasData)
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error)
      setError("Erro ao carregar dados do dashboard. Verifique se o backend está rodando.")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  const getPercentageColor = (percentage) => {
    if (percentage > 0) return "text-green-500"
    if (percentage < 0) return "text-red-500"
    return "text-gray-500"
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF1943"]

  const PieChartWithCustomizedLabel = ({ data }) => {
    const total = data.reduce((sum, entry) => sum + entry.valor, 0)

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5
      const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180)
      const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180)

      return (
        <text
          x={x}
          y={y}
          fill="white"
          textAnchor={x > cx ? "start" : "end"}
          dominantBaseline="central"
          className="text-xs font-bold"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      )
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="valor"
            nameKey="nome"
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(value)} />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  const LineChartWithCustomTooltip = ({ data }) => {
    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white/90 dark:bg-gray-800/90 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
            <p className="text-sm text-green-600 dark:text-green-400">{`Saldo: ${formatCurrency(payload[0].value)}`}</p>
          </div>
        )
      }
      return null
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
          <XAxis dataKey="mesAno" stroke="#6b7280" className="dark:stroke-gray-400" />
          <YAxis stroke="#6b7280" className="dark:stroke-gray-400" tickFormatter={formatCurrency} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="saldo" stroke="#8884d8" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    )
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Erro ao carregar dados</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
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
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/80 to-accent p-8 text-white shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-0" />
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-balance">Bem-vindo de volta! 👋</h1>
                <p className="text-primary-foreground/80 mt-2 text-lg">
                  Aqui está uma visão geral do seu patrimônio financeiro
                </p>
              </div>
              <Button
                className="bg-white text-primary hover:bg-gray-100 shadow-lg font-semibold"
                onClick={() => (window.location.href = "/despesas")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Transação
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Balance */}
          <AnimatedCard delay={0.1} className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <AnimatedCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <AnimatedCardTitle className="text-sm font-semibold text-primary">Saldo Total</AnimatedCardTitle>
              <div className="bg-primary/20 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <div className="text-3xl font-bold text-foreground">{formatCurrency(summary.saldoTotal)}</div>
              <p className="text-xs text-muted-foreground mt-2">
                {carteiras.length} carteira{carteiras.length !== 1 ? "s" : ""}
              </p>
            </AnimatedCardContent>
          </AnimatedCard>

          {/* Revenue */}
          <AnimatedCard delay={0.2} className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <AnimatedCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <AnimatedCardTitle className="text-sm font-semibold text-green-600 dark:text-green-400">
                Receitas
              </AnimatedCardTitle>
              <div className="bg-green-500/20 p-2 rounded-lg">
                <ArrowUpCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(summary.receitas)}
              </div>
              <p
                className={cn(
                  "text-xs mt-2",
                  getPercentageColor(calculatePercentageChange(summary.receitas, summary.receitasMesAnterior)),
                )}
              >
                {calculatePercentageChange(summary.receitas, summary.receitasMesAnterior).toFixed(1)}% vs. mês passado
              </p>
            </AnimatedCardContent>
          </AnimatedCard>

          {/* Expenses */}
          <AnimatedCard delay={0.3} className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
            <AnimatedCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <AnimatedCardTitle className="text-sm font-semibold text-red-600 dark:text-red-400">
                Despesas
              </AnimatedCardTitle>
              <div className="bg-red-500/20 p-2 rounded-lg">
                <ArrowDownCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(summary.despesas)}
              </div>
              <p
                className={cn(
                  "text-xs mt-2",
                  getPercentageColor(calculatePercentageChange(summary.despesasMesAnterior, summary.despesas)),
                )}
              >
                {calculatePercentageChange(summary.despesasMesAnterior, summary.despesas).toFixed(1)}% vs. mês passado
              </p>
            </AnimatedCardContent>
          </AnimatedCard>

          {/* Credit Cards */}
          <AnimatedCard delay={0.4} className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <AnimatedCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <AnimatedCardTitle className="text-sm font-semibold text-accent">Cartões</AnimatedCardTitle>
              <div className="bg-accent/20 p-2 rounded-lg">
                <CreditCard className="h-5 w-5 text-accent" />
              </div>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <div className="text-3xl font-bold text-foreground">{formatCurrency(summary.cartoes)}</div>
              <p className="text-xs text-muted-foreground mt-2">Fatura atual</p>
            </AnimatedCardContent>
          </AnimatedCard>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Distribuição de Despesas (Gráfico de Pizza) */}
          <AnimatedCard delay={0.5} className="lg:col-span-1">
            <AnimatedCardHeader>
              <AnimatedCardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Distribuição de Despesas
              </AnimatedCardTitle>
              <AnimatedCardDescription>Gastos por categoria este mês</AnimatedCardDescription>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              {despesasPorCategoria.length > 0 ? (
                <ChartContainer config={{}} className="min-h-[300px]">
                  <PieChartWithCustomizedLabel data={despesasPorCategoria} />
                </ChartContainer>
              ) : (
                <div className="text-center py-8">
                  <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Nenhuma despesa registrada para o gráfico.</p>
                </div>
              )}
            </AnimatedCardContent>
          </AnimatedCard>

          {/* Evolução do Saldo (Gráfico de Linha) */}
          <AnimatedCard delay={0.6} className="lg:col-span-2">
            <AnimatedCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <AnimatedCardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Evolução do Saldo
                  </AnimatedCardTitle>
                  <AnimatedCardDescription>Seu saldo ao longo do tempo</AnimatedCardDescription>
                </div>
                {/* Filtro por Carteira (A ser implementado) */}
                <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Todas as carteiras" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as carteiras</SelectItem>
                    {carteiras.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              {evolucaoSaldo.length > 0 ? (
                <ChartContainer config={{}} className="min-h-[300px]">
                  <LineChartWithCustomTooltip data={evolucaoSaldo} />
                </ChartContainer>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Dados insuficientes para o gráfico de evolução.</p>
                </div>
              )}
            </AnimatedCardContent>
          </AnimatedCard>
        </div>

        <AnimatedCard delay={0.7} className="border-primary/20">
          <AnimatedCardHeader>
            <AnimatedCardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Ações Rápidas
            </AnimatedCardTitle>
            <AnimatedCardDescription>Acesso rápido às principais funcionalidades</AnimatedCardDescription>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="flex flex-col h-auto py-4 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 bg-transparent"
                onClick={() => (window.location.href = "/despesas")}
              >
                <Plus className="w-6 h-6 mb-2 text-primary" />
                <span className="text-xs font-semibold">Nova Transação</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col h-auto py-4 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 bg-transparent"
                onClick={() => (window.location.href = "/carteiras")}
              >
                <Wallet className="w-6 h-6 mb-2 text-primary" />
                <span className="text-xs font-semibold">Carteiras</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col h-auto py-4 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 bg-transparent"
                onClick={() => (window.location.href = "/cartao-credito")}
              >
                <CreditCard className="w-6 h-6 mb-2 text-primary" />
                <span className="text-xs font-semibold">Cartão de Crédito</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col h-auto py-4 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 bg-transparent"
                onClick={() => (window.location.href = "/despesas")}
              >
                <Calendar className="w-6 h-6 mb-2 text-primary" />
                <span className="text-xs font-semibold">Transações</span>
              </Button>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      </div>
    </Layout>
  )
}

export default Dashboard
