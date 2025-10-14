import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Tag, 
  ShoppingCart, 
  Car, 
  Home, 
  Gamepad2, 
  Heart, 
  GraduationCap,
  Coffee,
  Plane,
  Gift
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { LoadingButton } from './LoadingSpinner'
import { cn } from '../lib/utils'

const CategoryForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  category = null,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    nome: ''
  })

  const [errors, setErrors] = useState({})

  const categoriasSugeridas = [
    { nome: 'Alimentação', icon: ShoppingCart },
    { nome: 'Transporte', icon: Car },
    { nome: 'Moradia', icon: Home },
    { nome: 'Lazer', icon: Gamepad2 },
    { nome: 'Saúde', icon: Heart },
    { nome: 'Educação', icon: GraduationCap },
    { nome: 'Café & Restaurantes', icon: Coffee },
    { nome: 'Viagens', icon: Plane },
    { nome: 'Presentes', icon: Gift }
  ]

  useEffect(() => {
    if (category) {
      setFormData({
        nome: category.nome || ''
      })
    } else {
      setFormData({
        nome: ''
      })
    }
    setErrors({})
  }, [category, isOpen])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome da categoria é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    onSubmit(formData)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSuggestionClick = (nome) => {
    handleChange('nome', nome)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
          <DialogDescription>
            {category 
              ? 'Atualize o nome da categoria'
              : 'Crie uma nova categoria para organizar suas transações'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Categoria</Label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="nome"
                placeholder="Ex: Alimentação, Transporte..."
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                className={cn("pl-10", errors.nome && "border-red-500")}
              />
            </div>
            {errors.nome && (
              <p className="text-sm text-red-600">{errors.nome}</p>
            )}
          </div>

          {/* Sugestões */}
          {!category && (
            <div className="space-y-2">
              <Label>Sugestões de Categorias</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {categoriasSugeridas.map((sugestao) => {
                  const Icon = sugestao.icon
                  return (
                    <Button
                      key={sugestao.nome}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(sugestao.nome)}
                      className="justify-start h-auto p-2 text-left"
                    >
                      <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-xs truncate">{sugestao.nome}</span>
                    </Button>
                  )
                })}
              </div>
              <p className="text-xs text-gray-500">
                Clique em uma sugestão para usar ou digite um nome personalizado
              </p>
            </div>
          )}

          {/* Preview */}
          {formData.nome && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Prévia da Categoria:
              </p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Tag className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formData.nome}
                </span>
              </div>
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
              {category ? 'Atualizar' : 'Criar'} Categoria
            </LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CategoryForm
