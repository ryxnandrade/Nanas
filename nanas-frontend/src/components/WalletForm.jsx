import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Wallet, 
  DollarSign, 
  CreditCard, 
  PiggyBank, 
  TrendingUp,
  Building
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
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

const WalletForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  wallet = null,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'CONTA_CORRENTE', 
    saldo: ''
  })

  const [errors, setErrors] = useState({})

  const tiposCarteira = [
    { value: 'CONTA_CORRENTE', label: 'Conta Corrente', icon: CreditCard },
    { value: 'POUPANCA', label: 'Poupança', icon: PiggyBank },
    { value: 'INVESTIMENTO', label: 'Investimentos', icon: TrendingUp },
    { value: 'CARTAO_CREDITO', label: 'Cartão de Crédito', icon: CreditCard },
    { value: 'DINHEIRO', label: 'Dinheiro', icon: DollarSign },
    { value: 'OUTRO', label: 'Outro', icon: Building }
  ]

  useEffect(() => {
    if (wallet) {
      setFormData({
        nome: wallet.nome || '',
        tipo: wallet.tipo || 'CONTA_CORRENTE',
        saldo: wallet.saldo?.toString() || '' 
      })
    } else {
      setFormData({
        nome: '',
        tipo: 'CONTA_CORRENTE',
        saldo: '' 
      })
    }
    setErrors({})
  }, [wallet, isOpen])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome da carteira é obrigatório'
    }

    if (formData.saldo && isNaN(parseFloat(formData.saldo))) {
      newErrors.saldo = 'Saldo deve ser um número válido'
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
      nome: formData.nome,
      tipo: formData.tipo,
      saldo: formData.saldo ? parseFloat(formData.saldo) : 0
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
    const tipoObj = tiposCarteira.find(t => t.value === tipo)
    const Icon = tipoObj?.icon || Wallet
    return <Icon className="w-4 h-4" />
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {wallet ? 'Editar Carteira' : 'Nova Carteira'}
          </DialogTitle>
          <DialogDescription>
            {wallet 
              ? 'Atualize os dados da carteira'
              : 'Preencha os dados para criar uma nova carteira'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Carteira</Label>
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="nome"
                placeholder="Ex: Conta Corrente, Poupança..."
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                className={cn("pl-10", errors.nome && "border-red-500")}
              />
            </div>
            {errors.nome && (
              <p className="text-sm text-red-600">{errors.nome}</p>
            )}
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Carteira</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => handleChange('tipo', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tiposCarteira.map((tipo) => {
                  const Icon = tipo.icon
                  return (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {tipo.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Saldo */}
          <div className="space-y-2">
            <Label htmlFor="saldo">
              {wallet ? 'Saldo Atual' : 'Saldo Inicial'} (Opcional)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="saldo"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.saldo}
                onChange={(e) => handleChange('saldo', e.target.value)}
                className={cn("pl-10", errors.saldo && "border-red-500")}
              />
            </div>
            {errors.saldo && (
              <p className="text-sm text-red-600">{errors.saldo}</p>
            )}
            <p className="text-xs text-gray-500">
              {wallet 
                ? 'Deixe em branco para manter o saldo atual'
                : 'Deixe em branco para começar com saldo zero'
              }
            </p>
          </div>

          {/* Preview Card */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Prévia da Carteira:
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                {getTypeIcon(formData.tipo)}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formData.nome || 'Nome da carteira'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tiposCarteira.find(t => t.value === formData.tipo)?.label}
                </p>
              </div>
            </div>
          </div>

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
              {wallet ? 'Atualizar' : 'Criar'} Carteira
            </LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default WalletForm
