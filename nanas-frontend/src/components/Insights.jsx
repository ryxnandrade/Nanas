import { useState, useEffect } from 'react'
import Layout from './Layout'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Badge } from './ui/badge'
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import api from '../services/api'  

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export default function Insights() {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    carregarInsights()
  }, [])

 const carregarInsights = async () => {
  try {
    const response = await api.getInsights()
    setInsights(response)
  } catch (err) {
    setError('Erro ao carregar insights: ' + err.message)
  } finally {
    setLoading(false)
  }
}

  const getInsightIcon = (tipo) => {
    switch (tipo) {
      case 'ALERTA':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'SUCESSO':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'INFORMACAO':
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return <Lightbulb className="h-5 w-5 text-yellow-600" />
    }
  }

  const getInsightBadgeVariant = (tipo) => {
    switch (tipo) {
      case 'ALERTA':
        return 'destructive'
      case 'SUCESSO':
        return 'default'
      case 'INFORMACAO':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getInsightCardClass = (tipo) => {
    switch (tipo) {
      case 'ALERTA':
        return 'border-red-200 bg-red-50'
      case 'SUCESSO':
        return 'border-green-200 bg-green-50'
      case 'INFORMACAO':
        return 'border-blue-200 bg-blue-50'
      default:
        return ''
    }
  }

  const getTipoLabel = (tipo) => {
    const labels = {
      ALERTA: 'Alerta',
      SUCESSO: 'Sucesso',
      INFORMACAO: 'Informação'
    }
    return labels[tipo] || tipo
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando insights...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Lightbulb className="h-8 w-8" />
            Insights Financeiros
          </h1>
          <p className="text-gray-600 mt-2">
            Análises inteligentes do seu comportamento financeiro
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {insights.length > 0 ? (
          <div className="grid gap-4">
            {insights.map((insight, index) => (
              <Card key={index} className={getInsightCardClass(insight.tipo)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getInsightIcon(insight.tipo)}
                      <div>
                        <CardTitle className="text-lg">{insight.titulo}</CardTitle>
                        {insight.categoria && (
                          <p className="text-sm text-gray-600 mt-1">
                            Categoria: {insight.categoria}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={getInsightBadgeVariant(insight.tipo)}>
                      {getTipoLabel(insight.tipo)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{insight.mensagem}</p>
                  
                  {(insight.valorAtual || insight.valorComparacao) && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-white bg-opacity-50 p-4 rounded-lg">
                      {insight.valorAtual && (
                        <div>
                          <span className="text-gray-600">Valor Atual:</span>
                          <p className="font-semibold text-lg">
                            R$ {insight.valorAtual.toFixed(2)}
                          </p>
                        </div>
                      )}
                      {insight.valorComparacao && (
                        <div>
                          <span className="text-gray-600">Valor de Comparação:</span>
                          <p className="font-semibold text-lg">
                            R$ {insight.valorComparacao.toFixed(2)}
                          </p>
                        </div>
                      )}
                      {insight.percentualVariacao && (
                        <div>
                          <span className="text-gray-600">Variação:</span>
                          <p className={`font-semibold text-lg flex items-center gap-1 ${
                            insight.percentualVariacao > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {insight.percentualVariacao > 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            {Math.abs(insight.percentualVariacao).toFixed(2)}%
                          </p>
                        </div>
                      )}
                      {insight.periodo && (
                        <div>
                          <span className="text-gray-600">Período:</span>
                          <p className="font-semibold">
                            {insight.periodo}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Lightbulb className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum insight disponível</h3>
              <p className="text-gray-600 text-center">
                Continue registrando suas transações para que possamos gerar insights sobre seu comportamento financeiro
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Como funcionam os insights?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700">
            <p>
              • <strong>Comparação Mensal:</strong> Comparamos seus gastos do mês atual com a média dos últimos 3 meses para identificar aumentos ou reduções significativas.
            </p>
            <p>
              • <strong>Gastos Incomuns:</strong> Detectamos gastos que estão significativamente acima da sua média histórica usando análise estatística.
            </p>
            <p>
              • <strong>Tendências:</strong> Identificamos padrões de aumento ou redução consistente em categorias específicas ao longo do tempo.
            </p>
            <p>
              • <strong>Economia:</strong> Destacamos quando você consegue economizar em comparação com períodos anteriores.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
