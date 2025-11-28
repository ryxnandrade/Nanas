import { useState, useEffect } from 'react'
import Layout from './Layout'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Alert, AlertDescription } from './ui/alert'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Target,
  Wallet,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import api from '../services/api'

export default function RelatorioMensal() {
  const [relatorio, setRelatorio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mesAtual, setMesAtual] = useState(new Date())

  useEffect(() => {
    carregarRelatorio()
  }, [mesAtual])

  const carregarRelatorio = async () => {
  setLoading(true)
  try {
    const ano = mesAtual.getFullYear()
    const mes = mesAtual.getMonth() + 1

    const data = await api.getRelatorioMensal(ano, mes)
    setRelatorio(data)
    
  } catch (err) {
    setError('Erro ao carregar relatório: ' + err.message)
  } finally {
    setLoading(false)
  }
}


  const mudarMes = (direcao) => {
    const novaData = new Date(mesAtual)
    novaData.setMonth(novaData.getMonth() + direcao)
    setMesAtual(novaData)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'POSITIVO':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'NEGATIVO':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'POSITIVO':
        return 'Situação Positiva'
      case 'NEGATIVO':
        return 'Atenção Necessária'
      default:
        return 'Situação Estável'
    }
  }

  const getMetaStatusColor = (status) => {
    switch (status) {
      case 'ATINGIDA':
        return 'bg-green-600'
      case 'EXCEDIDA':
        return 'bg-red-600'
      default:
        return 'bg-blue-600'
    }
  }

  const formatMes = (data) => {
    return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando relatório...</div>
        </div>
      </Layout>
    )
  }

  if (!relatorio) {
    return (
      <Layout>
        <Alert variant="destructive">
          <AlertDescription>Não foi possível carregar o relatório</AlertDescription>
        </Alert>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Relatório Mensal
            </h1>
            <p className="text-gray-600 mt-2">
              Resumo consolidado da sua atividade financeira
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => mudarMes(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <Calendar className="h-4 w-4" />
              <span className="font-semibold capitalize">{formatMes(mesAtual)}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => mudarMes(1)}
              disabled={mesAtual >= new Date()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Status Financeiro */}
        <Card className={getStatusColor(relatorio.statusFinanceiro)}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">
                  {getStatusLabel(relatorio.statusFinanceiro)}
                </h3>
                <p className="text-sm mt-1">
                  Saldo do período: R$ {relatorio.saldoFinal.toFixed(2)}
                </p>
              </div>
              {relatorio.percentualVariacao !== 0 && (
                <div className="flex items-center gap-2">
                  {relatorio.percentualVariacao > 0 ? (
                    <TrendingUp className="h-8 w-8" />
                  ) : (
                    <TrendingDown className="h-8 w-8" />
                  )}
                  <span className="text-2xl font-bold">
                    {Math.abs(relatorio.percentualVariacao).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resumo Financeiro */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {relatorio.totalReceitas.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {relatorio.totalDespesas.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Final</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                relatorio.saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                R$ {relatorio.saldoFinal.toFixed(2)}
              </div>
              {relatorio.variacaoMesAnterior !== 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  {relatorio.variacaoMesAnterior > 0 ? '+' : ''}
                  R$ {relatorio.variacaoMesAnterior.toFixed(2)} vs mês anterior
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Despesas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {relatorio.despesasPorCategoria.length > 0 ? (
              <div className="space-y-4">
                {relatorio.despesasPorCategoria.map((despesa, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{despesa.categoria}</span>
                      <span className="text-gray-600">
                        R$ {despesa.valor.toFixed(2)} ({despesa.percentual.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={despesa.percentual} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">
                Nenhuma despesa registrada neste período
              </p>
            )}
          </CardContent>
        </Card>

        {/* Progresso das Metas */}
        {relatorio.progressoMetas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Progresso das Metas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {relatorio.progressoMetas.map((meta, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{meta.nomeCategoria}</h4>
                        <p className="text-sm text-gray-600">
                          R$ {meta.valorAtual.toFixed(2)} de R$ {meta.valorMeta.toFixed(2)}
                        </p>
                      </div>
                      <Badge className={getMetaStatusColor(meta.status)}>
                        {meta.status === 'ATINGIDA' && 'Atingida'}
                        {meta.status === 'EXCEDIDA' && 'Excedida'}
                        {meta.status === 'EM_PROGRESSO' && 'Em Progresso'}
                      </Badge>
                    </div>
                    <Progress 
                      value={Math.min(meta.percentualAtingido, 100)} 
                      className="h-2"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      {meta.percentualAtingido.toFixed(1)}% atingido
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Maiores Transações */}
        {relatorio.maioresTransacoes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Maiores Despesas do Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {relatorio.maioresTransacoes.map((transacao, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-3 last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium">{transacao.descricao}</p>
                      <p className="text-sm text-gray-600">
                        {transacao.categoria} • {new Date(transacao.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className="font-bold text-red-600">
                      R$ {transacao.valor.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resumo das Carteiras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Resumo das Carteiras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b font-semibold">
                <span>Saldo Total</span>
                <span className="text-xl text-green-600">
                  R$ {relatorio.resumoCarteiras.saldoTotal.toFixed(2)}
                </span>
              </div>
              {relatorio.resumoCarteiras.carteiras.map((carteira, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{carteira.nome}</p>
                    <p className="text-sm text-gray-600">{carteira.tipo}</p>
                  </div>
                  <span className="font-semibold">
                    R$ {carteira.saldo.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
