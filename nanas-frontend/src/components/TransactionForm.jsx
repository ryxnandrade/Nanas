import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  DollarSign, 
  Calendar, 
  FileText, 
  Wallet, 
  Tag,
  ArrowRightLeft,
  Plus
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { LoadingButton } from './LoadingSpinner'
import { cn } from '../lib/utils'
import CategoryForm from './CategoryForm'
import ApiService from '../services/api'
import useAuth from '../hooks/useAuth'

const TransactionForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  transaction = null,
  carteiras = [],
  categorias: initialCategorias = [],
  isLoading = false 
}) => {
  const { userData } = useAuth()
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    tipo: 'DESPESA',
    data: new Date().toISOString().split('T')[0],
    carteiraOrigemId: '',
    carteiraDestinoId: '',
    categoriaId: ''
  })

  const [errors, setErrors] = useState({})
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false)
  const [localCategorias, setLocalCategorias] = useState(initialCategorias)

  useEffect(() => {
    setLocalCategorias(initialCategorias)
  }, [initialCategorias])

  useEffect(() => {
    if (transaction) {
      setFormData({
        descricao: transaction.descricao || '',
        valor: transaction.valor?.toString() || '',
        tipo: transaction.tipo || 'DESPESA',
        data: transaction.data || new Date().toISOString().split('T')[0],
        carteiraOrigemId: transaction.carteiraOrigemId?.toString() || '',
        carteiraDestinoId: transaction.carteiraDestinoId?.toString() || '',
        categoriaId: transaction.categoriaId?.toString() || ''
      })
    } else {
      setFormData({
        descricao: '',
        valor: '',
        tipo: 'DESPESA',
        data: new Date().toISOString().split('T')[0],
        carteiraOrigemId: '',
        carteiraDestinoId: '',
        categoriaId: ''
      })
    }
    setErrors({})
  }, [transaction, isOpen])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória'
    }

    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      newErrors.valor = 'Valor deve ser maior que zero'
    }

    if (!formData.carteiraOrigemId) {
      newErrors.carteiraOrigemId = 'Carteira de origem é obrigatória'
    }

    if (formData.tipo === 'TRANSFERENCIA' && !formData.carteiraDestinoId) {
      newErrors.carteiraDestinoId = 'Carteira de destino é obrigatória para transferências'
    }

    if (formData.tipo === 'TRANSFERENCIA' && formData.carteiraOrigemId === formData.carteiraDestinoId) {
      newErrors.carteiraDestinoId = 'Carteira de destino deve ser diferente da origem'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const submitData = {
      ...formData,
      valor: parseFloat(formData.valor),
      carteiraOrigemId: parseInt(formData.carteiraOrigemId),
      carteiraDestinoId: formData.carteiraDestinoId ? parseInt(formData.carteiraDestinoId) : null,
      categoriaId: formData.categoriaId ? parseInt(formData.categoriaId) : null
    }

    onSubmit(submitData)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getTypeIcon = (tipo) => {
    switch (tipo) {
      case 'RECEITA':
        return <DollarSign className="w-4 h-4 text-green-600" />
      case 'DESPESA':
        return <DollarSign className="w-4 h-4 text-red-600" />
      case 'TRANSFERENCIA':
        return <ArrowRightLeft className="w-4 h-4 text-blue-600" />
      default:
        return <DollarSign className="w-4 h-4" />
    }
  }

  const handleCreateCategory = async (categoryData) => {
    try {
      const newCategory = await ApiService.createCategoria(categoryData, userData?.id)
      setLocalCategorias([...localCategorias, newCategory])
      setIsCategoryFormOpen(false)
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
      throw error
    }
  }

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </DialogTitle>
          <DialogDescription>
            {transaction 
              ? 'Atualize os dados da transação'
              : 'Preencha os dados para criar uma nova transação'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Transação</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => handleChange('tipo', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RECEITA">
                  <div className="flex items-center gap-2">
                    {getTypeIcon('RECEITA')}
                    Receita
                  </div>
                </SelectItem>
                <SelectItem value="DESPESA">
                  <div className="flex items-center gap-2">
                    {getTypeIcon('DESPESA')}
                    Despesa
                  </div>
                </SelectItem>
                <SelectItem value="TRANSFERENCIA">
                  <div className="flex items-center gap-2">
                    {getTypeIcon('TRANSFERENCIA')}
                    Transferência
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="descricao"
                placeholder="Ex: Compra no supermercado"
                value={formData.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
                className={cn("pl-10", errors.descricao && "border-red-500")}
              />
            </div>
            {errors.descricao && (
              <p className="text-sm text-red-600">{errors.descricao}</p>
            )}
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="valor">Valor</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="valor"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.valor}
                onChange={(e) => handleChange('valor', e.target.value)}
                className={cn("pl-10", errors.valor && "border-red-500")}
              />
            </div>
            {errors.valor && (
              <p className="text-sm text-red-600">{errors.valor}</p>
            )}
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="data">Data</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => handleChange('data', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Carteira de Origem */}
          <div className="space-y-2">
            <Label htmlFor="carteiraOrigem">
              {formData.tipo === 'TRANSFERENCIA' ? 'Carteira de Origem' : 'Carteira'}
            </Label>
            <Select
              value={formData.carteiraOrigemId}
              onValueChange={(value) => handleChange('carteiraOrigemId', value)}
            >
              <SelectTrigger className={cn(errors.carteiraOrigemId && "border-red-500")}>
                <SelectValue placeholder="Selecione uma carteira" />
              </SelectTrigger>
              <SelectContent>
                {carteiras.map((carteira) => (
                  <SelectItem key={carteira.id} value={carteira.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      {carteira.nome}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.carteiraOrigemId && (
              <p className="text-sm text-red-600">{errors.carteiraOrigemId}</p>
            )}
          </div>

          {/* Carteira de Destino (apenas para transferências) */}
          {formData.tipo === 'TRANSFERENCIA' && (
            <div className="space-y-2">
              <Label htmlFor="carteiraDestino">Carteira de Destino</Label>
              <Select
                value={formData.carteiraDestinoId}
                onValueChange={(value) => handleChange('carteiraDestinoId', value)}
              >
                <SelectTrigger className={cn(errors.carteiraDestinoId && "border-red-500")}>
                  <SelectValue placeholder="Selecione a carteira de destino" />
                </SelectTrigger>
                <SelectContent>
                  {carteiras
                    .filter(carteira => carteira.id.toString() !== formData.carteiraOrigemId)
                    .map((carteira) => (
                      <SelectItem key={carteira.id} value={carteira.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4" />
                          {carteira.nome}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.carteiraDestinoId && (
                <p className="text-sm text-red-600">{errors.carteiraDestinoId}</p>
              )}
            </div>
          )}

          {/* Categoria (não obrigatória para transferências) */}
          {formData.tipo !== 'TRANSFERENCIA' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="categoria">Categoria (Opcional)</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCategoryFormOpen(true)}
                  className="h-8 px-2 text-xs"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Nova Categoria
                </Button>
              </div>
              <Select
                value={formData.categoriaId}
                onValueChange={(value) => handleChange('categoriaId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {localCategorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        {categoria.nome}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <LoadingButton
              type="submit"
              isLoading={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {transaction ? 'Atualizar' : 'Criar'} Transação
            </LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    {/* Category Form */}
    <CategoryForm
      isOpen={isCategoryFormOpen}
      onClose={() => setIsCategoryFormOpen(false)}
      onSubmit={handleCreateCategory}
    />
  </>
  )
}

export default TransactionForm
