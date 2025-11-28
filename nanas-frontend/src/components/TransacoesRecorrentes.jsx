import { useState, useEffect } from 'react'
import Layout from './Layout'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Alert, AlertDescription } from './ui/alert'
import { Badge } from './ui/badge'
import { Repeat, Plus, Edit, Trash2, CheckCircle, XCircle, Calendar, Play } from 'lucide-react'
import { getAuth } from 'firebase/auth'
import ApiService from '../services/api';
import Swal from 'sweetalert2'

export default function TransacoesRecorrentes() {
  const [transacoes, setTransacoes] = useState([])
  const [carteiras, setCarteiras] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransacao, setEditingTransacao] = useState(null)
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    tipo: 'DESPESA',
    frequencia: 'MENSAL',
    diaVencimento: '',
    dataInicio: '',
    dataFim: '',
    carteiraId: '',
    categoriaId: ''
  })

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const auth = getAuth()
      const token = await auth.currentUser?.getIdToken()
      
const [transacoesRes, carteirasRes, categoriasRes] = await Promise.all([
  ApiService.getTransacoesRecorrentes(),
  ApiService.getCarteiras(),
  ApiService.getCategorias()
]);
      
      setTransacoes(transacoesRes?.data ?? transacoesRes ?? [])
      setCarteiras(carteirasRes?.data ?? carteirasRes ?? [])
      setCategorias(categoriasRes?.data ?? categoriasRes ?? [])
    } catch (err) {
      setError('Erro ao carregar dados: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  });


  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const auth = getAuth()
      const token = await auth.currentUser?.getIdToken()

      const transacaoData = {
        ...formData,
        valor: parseFloat(formData.valor),
        carteiraId: parseInt(formData.carteiraId),
        categoriaId: formData.categoriaId === "0" ? null : parseInt(formData.categoriaId),
        diaVencimento: formData.diaVencimento ? parseInt(formData.diaVencimento) : null,
        dataFim: formData.dataFim || null
      }

      if (editingTransacao) {
        await ApiService.updateTransacaoRecorrente(editingTransacao.id, transacaoData)

          Toast.fire({
        icon: "success",
        title: "Transação recorrente atualizada com sucesso!"
      });
      } else {
        await ApiService.createTransacaoRecorrente(transacaoData)
        Toast.fire({
          icon: "success",
          title: "Transação recorrente criada com sucesso!"
        });
      }

      setDialogOpen(false)
      resetForm()
      carregarDados()
    } catch (err) {
      setError('Erro ao salvar transação recorrente: ' + err.message)
    }
  }

  const handleEdit = (transacao) => {
    setEditingTransacao(transacao)
    setFormData({
      descricao: transacao.descricao,
      valor: transacao.valor.toString(),
      tipo: transacao.tipo,
      frequencia: transacao.frequencia,
      diaVencimento: transacao.diaVencimento?.toString() || '',
      dataInicio: transacao.dataInicio,
      dataFim: transacao.dataFim || '',
      carteiraId: transacao.carteiraId.toString(),
      categoriaId: transacao.categoriaId?.toString() || ''
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
  title: 'Excluir transação?',
  text: 'Esta ação não pode ser desfeita.',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Sim, excluir',
  cancelButtonText: 'Cancelar'
})

if (!result.isConfirmed) return


    try {
      const auth = getAuth()
      const token = await auth.currentUser?.getIdToken()

      await ApiService.deleteTransacaoRecorrente(id)

      Toast.fire({
        icon: "success",
        title: "Transação recorrente excluída com sucesso!"
      });

      carregarDados()
    } catch (err) {
      Toast.fire({
        icon: "success",
        title: "Erro ao excluir transação recorrente: " + err.message
      });

    }
  }

  const handleToggleStatus = async (id, ativa) => {
    try {
      const auth = getAuth()
      const token = await auth.currentUser?.getIdToken()
      await ApiService.updateStatusTransacaoRecorrente(id, !ativa)
      
      Toast.fire({
        icon: "success",
        title: "Status da transação atualizado!"
      });
      carregarDados()
    } catch (err) {
         Toast.fire({
        icon: "error",
        title: "Erro ao atualizar status: " + err.message
      });
    }
  }

  const handleExecutar = async (id) => {
    const result = await Swal.fire({
  title: 'Executar agora?',
  text: 'A transação será lançada imediatamente.',
  icon: 'question',
  showCancelButton: true,
  confirmButtonText: 'Executar',
  cancelButtonText: 'Cancelar'
})

if (!result.isConfirmed) return


    try {
      const auth = getAuth()
      const token = await auth.currentUser?.getIdToken()

      await ApiService.executarTransacaoRecorrente(id)

         Toast.fire({
            icon: "success",
            title: "Transação executada com sucesso!"
          });
      carregarDados()
    } catch (err) {
         Toast.fire({
        icon: "error",
        title: "Erro ao executar transação: " + err.message
      });
    }
  }

  const resetForm = () => {
    setFormData({
      descricao: '',
      valor: '',
      tipo: 'DESPESA',
      frequencia: 'MENSAL',
      diaVencimento: '',
      dataInicio: '',
      dataFim: '',
      carteiraId: '',
      categoriaId: ''
    })
    setEditingTransacao(null)
  }

  const getFrequenciaLabel = (freq) => {
    const labels = {
      DIARIA: 'Diária',
      SEMANAL: 'Semanal',
      MENSAL: 'Mensal',
      ANUAL: 'Anual'
    }
    return labels[freq] || freq
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Repeat className="h-8 w-8" />
              Transações Recorrentes
            </h1>
            <p className="text-gray-600 mt-2">
              Gerencie suas receitas e despesas que se repetem automaticamente
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Transação Recorrente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTransacao ? 'Editar Transação Recorrente' : 'Nova Transação Recorrente'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RECEITA">Receita</SelectItem>
                        <SelectItem value="DESPESA">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="valor">Valor (R$)</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="frequencia">Frequência</Label>
                    <Select
                      value={formData.frequencia}
                      onValueChange={(value) => setFormData({ ...formData, frequencia: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DIARIA">Diária</SelectItem>
                        <SelectItem value="SEMANAL">Semanal</SelectItem>
                        <SelectItem value="MENSAL">Mensal</SelectItem>
                        <SelectItem value="ANUAL">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.frequencia === 'MENSAL' && (
                    <div>
                      <Label htmlFor="diaVencimento">Dia do Vencimento</Label>
                      <Input
                        id="diaVencimento"
                        type="number"
                        min="1"
                        max="31"
                        value={formData.diaVencimento}
                        onChange={(e) => setFormData({ ...formData, diaVencimento: e.target.value })}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="carteiraId">Carteira</Label>
                  <Select
                    value={formData.carteiraId}
                    onValueChange={(value) => setFormData({ ...formData, carteiraId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma carteira" />
                    </SelectTrigger>
                    <SelectContent>
                      {carteiras.map((cart) => (
                        <SelectItem key={cart.id} value={cart.id.toString()}>
                          {cart.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="categoriaId">Categoria (opcional)</Label>
                  <Select
                    value={formData.categoriaId}
                    onValueChange={(value) => setFormData({ ...formData, categoriaId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sem categoria</SelectItem>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dataInicio">Data Início</Label>
                    <Input
                      id="dataInicio"
                      type="date"
                      value={formData.dataInicio}
                      onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dataFim">Data Fim (opcional)</Label>
                    <Input
                      id="dataFim"
                      type="date"
                      value={formData.dataFim}
                      onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {editingTransacao ? 'Atualizar' : 'Criar'} Transação Recorrente
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          {transacoes.map((transacao) => (
            <Card key={transacao.id} className={!transacao.ativa ? 'opacity-60' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{transacao.descricao}</h3>
                      <Badge variant={transacao.tipo === 'RECEITA' ? 'default' : 'destructive'}>
                        {transacao.tipo}
                      </Badge>
                      <Badge variant={transacao.ativa ? 'default' : 'secondary'}>
                        {transacao.ativa ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Valor:</span>
                        <p className="font-semibold">R$ {transacao.valor.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Frequência:</span>
                        <p className="font-semibold">{getFrequenciaLabel(transacao.frequencia)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Carteira:</span>
                        <p className="font-semibold">{transacao.carteiraNome}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Categoria:</span>
                        <p className="font-semibold">{transacao.categoriaNome || 'Sem categoria'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Próxima execução:</span>
                        <p className="font-semibold flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(transacao.proximaExecucao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Início:</span>
                        <p className="font-semibold">
                          {new Date(transacao.dataInicio).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      {transacao.dataFim && (
                        <div>
                          <span className="text-gray-600">Fim:</span>
                          <p className="font-semibold">
                            {new Date(transacao.dataFim).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      )}
                      {transacao.diaVencimento && (
                        <div>
                          <span className="text-gray-600">Dia vencimento:</span>
                          <p className="font-semibold">{transacao.diaVencimento}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExecutar(transacao.id)}
                      title="Executar agora"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(transacao)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(transacao.id, transacao.ativa)}
                    >
                      {transacao.ativa ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(transacao.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {transacoes.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Repeat className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma transação recorrente cadastrada</h3>
              <p className="text-gray-600 text-center mb-4">
                Automatize suas receitas e despesas que se repetem regularmente
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira transação recorrente
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}
