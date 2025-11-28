import { useState, useEffect } from 'react'
import Layout from './Layout'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Alert, AlertDescription } from './ui/alert'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Target, TrendingUp, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'
import ApiService from '.././services/api.js'
import CategoryForm from './CategoryForm';


export default function Metas() {
    const [metas, setMetas] = useState([])
    const [categorias, setCategorias] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingMeta, setEditingMeta] = useState(null)
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
    const [loadingCategory, setLoadingCategory] = useState(false)
    const [formData, setFormData] = useState({
        nome: '',
        valorMeta: '',
        dataInicio: '',
        dataFim: '',
        periodo: 'MENSAL',
        categoriaId: ''
    })

    useEffect(() => {
        carregarDados()
    }, [])

    const carregarDados = async () => {
        try {
            setLoading(true)
            const metas = await ApiService.getMetas()
            const categorias = await ApiService.getCategorias()

            setMetas(metas)
            setCategorias(categorias)

        } catch (err) {
            setError("Erro ao carregar dados: " + err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateCategory = async (data) => {
    try {
        setLoadingCategory(true)
        const novaCat = await ApiService.createCategoria(data)

        const catList = await ApiService.getCategorias()
        setCategorias(catList)

        setFormData((prev) => ({
            ...prev,
            categoriaId: novaCat.id.toString()
        }))

        setCategoryDialogOpen(false)
    } catch (err) {
        setError("Erro ao criar categoria: " + err.message)
    } finally {
        setLoadingCategory(false)
    }
}


    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        try {
            const metaData = {
                ...formData,
                valorMeta: parseFloat(formData.valorMeta),
                categoriaId: parseInt(formData.categoriaId)
            }

            if (editingMeta) {
                await ApiService.updateMeta(editingMeta.id, metaData)
                setSuccess('Meta atualizada com sucesso!')
            } else {
                await ApiService.createMeta(metaData)
                setSuccess('Meta criada com sucesso!')
            }

            setDialogOpen(false)
            resetForm()
            carregarDados()
        } catch (err) {
            setError('Erro ao salvar meta: ' + err.message)
        }
    }

    const handleEdit = (meta) => {
        setEditingMeta(meta)
        setFormData({
            nome: meta.nome,
            valorMeta: meta.valorMeta.toString(),
            dataInicio: meta.dataInicio,
            dataFim: meta.dataFim,
            periodo: meta.periodo,
            categoriaId: meta.categoriaId.toString()
        })
        setDialogOpen(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir esta meta?')) return

        try {
            await ApiService.deleteMeta(id)

            setSuccess('Meta excluída com sucesso!')
            carregarDados()
        } catch (err) {
            setError('Erro ao excluir meta: ' + err.message)
        }
    }

    const handleToggleStatus = async (id, ativa) => {
        try {

            await ApiService.updateStatusMeta(id, !ativa)

            setSuccess('Status da meta atualizado!')
            carregarDados()
        } catch (err) {
            setError('Erro ao atualizar status: ' + err.message)
        }
    }

    const resetForm = () => {
        setFormData({
            nome: '',
            valorMeta: '',
            dataInicio: '',
            dataFim: '',
            periodo: 'MENSAL',
            categoriaId: ''
        })
        setEditingMeta(null)
    }

    const getStatusColor = (percentual) => {
        if (percentual >= 100) return 'text-red-600'
        if (percentual >= 80) return 'text-yellow-600'
        return 'text-green-600'
    }

    const getProgressColor = (percentual) => {
        if (percentual >= 100) return 'bg-red-600'
        if (percentual >= 80) return 'bg-yellow-600'
        return 'bg-green-600'
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
                            <Target className="h-8 w-8" />
                            Metas Orçamentárias
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Defina e acompanhe suas metas de gastos por categoria
                        </p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={(open) => {
                        setDialogOpen(open)
                        if (!open) resetForm()
                    }}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Nova Meta
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingMeta ? 'Editar Meta' : 'Nova Meta'}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="nome">Nome da Meta</Label>
                                    <Input
                                        id="nome"
                                        value={formData.nome}
                                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                        required
                                    />
                                </div>
                              <div>
<div className="flex items-center justify-between">
<Label htmlFor="categoriaId">Categoria</Label>

{/* Botão Nova Categoria */}
<Button 
type="button" 
variant="outline" 
size="sm" 
onClick={() => setCategoryDialogOpen(true)}
className="ml-2"
>
<Plus className="h-4 w-4 mr-1" />
Nova Categoria
</Button>
</div>

<Select
value={formData.categoriaId}
onValueChange={(value) => setFormData({ ...formData, categoriaId: value })}
>
<SelectTrigger>
<SelectValue placeholder="Selecione uma categoria" />
</SelectTrigger>
<SelectContent>
{categorias.map((cat) => (
<SelectItem key={cat.id} value={cat.id.toString()}>
{cat.nome}
</SelectItem>
))}
</SelectContent>
</Select>
</div>
                                <div>
                                    <Label htmlFor="valorMeta">Valor da Meta (R$)</Label>
                                    <Input
                                        id="valorMeta"
                                        type="number"
                                        step="0.01"
                                        value={formData.valorMeta}
                                        onChange={(e) => setFormData({ ...formData, valorMeta: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="periodo">Período</Label>
                                    <Select
                                        value={formData.periodo}
                                        onValueChange={(value) => setFormData({ ...formData, periodo: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MENSAL">Mensal</SelectItem>
                                            <SelectItem value="TRIMESTRAL">Trimestral</SelectItem>
                                            <SelectItem value="SEMESTRAL">Semestral</SelectItem>
                                            <SelectItem value="ANUAL">Anual</SelectItem>
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
                                        <Label htmlFor="dataFim">Data Fim</Label>
                                        <Input
                                            id="dataFim"
                                            type="date"
                                            value={formData.dataFim}
                                            onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full">
                                    {editingMeta ? 'Atualizar' : 'Criar'} Meta
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

                {success && (
                    <Alert className="bg-green-50 text-green-900 border-green-200">
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}

                {metas.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Target className="h-16 w-16 text-gray-400 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Nenhuma meta cadastrada</h3>
                            <p className="text-gray-600 text-center mb-4">
                                Comece criando sua primeira meta orçamentária para acompanhar seus gastos
                            </p>
                            <Button onClick={() => setDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Criar primeira meta
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {metas.map((meta) => (
                        <Card key={meta.id} className={!meta.ativa ? 'opacity-60' : ''}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{meta.nome}</CardTitle>
                                        <p className="text-sm text-gray-600 mt-1">{meta.categoriaNome}</p>
                                    </div>
                                    <Badge variant={meta.ativa ? 'default' : 'secondary'}>
                                        {meta.ativa ? 'Ativa' : 'Inativa'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Progresso</span>
                                        <span className={getStatusColor(meta.percentualAtingido)}>
                      {meta.percentualAtingido.toFixed(1)}%
                    </span>
                                    </div>
                                    <Progress
                                        value={meta.percentualAtingido}
                                        className={getProgressColor(meta.percentualAtingido)}
                                    />
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                  <span>
                    <TrendingUp className="inline h-4 w-4 mr-1" />
                    Meta: R$ {meta.valorMeta.toFixed(2)}
                  </span>
                                    <span>
                    <Target className="inline h-4 w-4 mr-1" />
                    Gasto: R$ {meta.valorAtual.toFixed(2)}
                  </span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                  <span>
                    Início: {new Date(meta.dataInicio).toLocaleDateString()}
                  </span>
                                    <span>
                    Fim: {new Date(meta.dataFim).toLocaleDateString()}
                  </span>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleToggleStatus(meta.id, meta.ativa)}
                                        title={meta.ativa ? 'Desativar Meta' : 'Ativar Meta'}
                                    >
                                        {meta.ativa ? (
                                            <XCircle className="h-4 w-4 text-red-500" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleEdit(meta)}
                                        title="Editar Meta"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleDelete(meta.id)}
                                        title="Excluir Meta"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            <CategoryForm
    isOpen={categoryDialogOpen}
    onClose={() => setCategoryDialogOpen(false)}
    onSubmit={handleCreateCategory}
    isLoading={loadingCategory}
/>
        </Layout>
    )
}
