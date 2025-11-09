import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { useAuth } from '../hooks/useAuth';
import ApiService from '../services/api';
import { AnimatedCard, AnimatedCardHeader, AnimatedCardContent, AnimatedCardTitle } from './AnimatedCard';
import { Button } from './ui/button';
import Swal from 'sweetalert2'; 
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, CreditCard, Calendar, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatDate = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

const CartaoCredito = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartoes, setCartoes] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [faturaAtual, setFaturaAtual] = useState([]);
  const [proximaFatura, setProximaFatura] = useState([]);
  const [newCard, setNewCard] = useState({ nome: '', limite: '', diaFechamento: '', diaVencimento: '' });
  const [newTransaction, setNewTransaction] = useState({ descricao: '', valor: '', data: '', categoriaId: '' });
  const [categorias, setCategorias] = useState([]);

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });

const handleNewCardChange = (e) => {
  const { id, value } = e.target;
  setNewCard(prev => ({ ...prev, [id]: value }));
};

const handleNewTransactionChange = (e) => {
  const { id, value } = e.target;
  setNewTransaction(prev => ({ ...prev, [id]: value }));
};

useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCardId && user) {
      loadFaturas(selectedCardId);
    }
  }, [selectedCardId, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cartoesData, categoriasData] = await Promise.all([
        ApiService.getCartoesCredito(),
        ApiService.getCategorias(),
      ]);
      setCartoes(cartoesData);
      setCategorias(categoriasData);
      if (cartoesData.length > 0) {
        setSelectedCardId(cartoesData[0].id);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const loadFaturas = async (cartaoId) => {
    try {
      const [atual, proxima] = await Promise.all([
        ApiService.getFaturaAtual(cartaoId),
        ApiService.getProximaFatura(cartaoId),
      ]);
      setFaturaAtual(atual);
      setProximaFatura(proxima);
    } catch (err) {
      console.log("ERRO loadFaturas")
    }
  };
  const handleCreateCard = async (e) => {
    e.preventDefault();
    try {
      const cardData = {
        ...newCard,
        limite: parseFloat(newCard.limite),
        diaFechamento: parseInt(newCard.diaFechamento),
        diaVencimento: parseInt(newCard.diaVencimento),
      };
      await ApiService.createCartaoCredito(cardData);
      setNewCard({ nome: '', limite: '', diaFechamento: '', diaVencimento: '' });
      loadData(); 
    } catch (err) {
      console.log("ERRO handleCreateCard")
    }
  };

const handleCreateTransaction = async (e) => {
  e.preventDefault();
  if (!selectedCardId) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Por favor, selecione um cartão de crédito primeiro.',
    });
    return;
  }

 try {
    const transactionData = {
      descricao: newTransaction.descricao,
      valor: parseFloat(newTransaction.valor),
      dataCompra: newTransaction.data,
      categoriaId: newTransaction.categoriaId ? parseInt(newTransaction.categoriaId) : null,
    };
    if (!transactionData.descricao || !transactionData.valor || !transactionData.dataCompra) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos Incompletos',
        text: 'Por favor, preencha todos os campos obrigatórios (Descrição, Valor, Data).',
      });
      return;
    }

    await ApiService.createTransacaoCartaoCredito(selectedCardId, transactionData);
    setNewTransaction({ descricao: '', valor: '', data: '', categoriaId: '' });
    loadFaturas(selectedCardId);
    Toast.fire({
      icon: 'success',
      title: 'Transação criada com sucesso!'
    });

  } catch (err) {
    console.error('Erro ao criar transação:', err);
    Swal.fire({
      icon: 'error',
      title: 'Erro na Criação',
      text: 'Não foi possível criar a transação. Verifique os dados e tente novamente.',
    });
  }
};

  const renderFatura = (fatura, titulo) => {
    const total = fatura.reduce((sum, t) => sum + t.valor, 0);
    const cartao = cartoes.find(c => c.id === selectedCardId);

    return (
      <AnimatedCard delay={0.1}>
        <AnimatedCardHeader>
          <AnimatedCardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {titulo}
          </AnimatedCardTitle>
          <p className="text-sm text-muted-foreground">
            {cartao ? `Fechamento: Dia ${cartao.diaFechamento} | Vencimento: Dia ${cartao.diaVencimento}` : 'Selecione um cartão'}
          </p>
        </AnimatedCardHeader>
        <AnimatedCardContent>
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-xl font-bold">Total: {formatCurrency(total)}</h3>
            <span className={cn("text-sm font-medium", total > cartao?.limite ? 'text-red-500' : 'text-green-500')}>
              Limite: {formatCurrency(cartao?.limite || 0)}
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fatura.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Nenhuma transação nesta fatura.</TableCell>
                </TableRow>
              ) : (
                fatura.map(transacao => (
                  <TableRow key={transacao.id}>
                    <TableCell className="font-medium">{transacao.descricao}</TableCell>
                    <TableCell>{formatDate(transacao.dataCompra)}</TableCell> 
                    <TableCell>{categorias.find(c => c.id === transacao.categoriaId)?.nome || 'Sem Categoria'}</TableCell>
                    <TableCell className="text-right text-red-600 font-semibold">
                      -{formatCurrency(transacao.valor)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </AnimatedCardContent>
      </AnimatedCard>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </Layout>
    );
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
            <Button onClick={() => loadData(user.firebaseUid)} className="bg-blue-600 hover:bg-blue-700">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Cartão de Crédito</h1>
        <p className="text-gray-600 dark:text-gray-400">Gerencie seus cartões e acompanhe suas faturas.</p>

        <Tabs defaultValue="faturas" className="w-full">
          <TabsList>
            <TabsTrigger value="faturas">Faturas</TabsTrigger>
            <TabsTrigger value="cadastrar-gasto">Cadastrar Gasto</TabsTrigger>
            <TabsTrigger value="gerenciar-cartoes">Gerenciar Cartões</TabsTrigger>
          </TabsList>

          <TabsContent value="faturas" className="space-y-6">
            <AnimatedCard delay={0.1}>
              <AnimatedCardHeader>
                <AnimatedCardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Selecione o Cartão
                </AnimatedCardTitle>
              </AnimatedCardHeader>
              <AnimatedCardContent>
                <Select
                  value={selectedCardId ? selectedCardId.toString() : ''}
                  onValueChange={(value) => setSelectedCardId(parseInt(value))}
                >
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Selecione um cartão" />
                  </SelectTrigger>
                  <SelectContent>
                    {cartoes.map(card => (
                      <SelectItem key={card.id} value={card.id.toString()}>
                        {card.nome} (Limite: {formatCurrency(card.limite)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </AnimatedCardContent>
            </AnimatedCard>

            {selectedCardId && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderFatura(faturaAtual, 'Fatura Atual')}
                {renderFatura(proximaFatura, 'Próxima Fatura')}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cadastrar-gasto" className="space-y-6">
            <AnimatedCard delay={0.1}>
              <AnimatedCardHeader>
                <AnimatedCardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Cadastrar Nova Transação de Cartão
                </AnimatedCardTitle>
              </AnimatedCardHeader>
              <AnimatedCardContent>
                <form onSubmit={handleCreateTransaction} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cartaoId">Cartão de Crédito</Label>
                      <Select
                        value={selectedCardId ? selectedCardId.toString() : ''}
                        onValueChange={(value) => setSelectedCardId(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cartão" />
                        </SelectTrigger>
                        <SelectContent>
                          {cartoes.map(card => (
                            <SelectItem key={card.id} value={card.id.toString()}>
                              {card.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Input id="descricao" value={newTransaction.descricao} onChange={handleNewTransactionChange} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor</Label>
                      <Input id="valor" type="number" step="0.01" value={newTransaction.valor} onChange={handleNewTransactionChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="data">Data da Compra</Label>
                      <Input id="data" type="date" value={newTransaction.data} onChange={handleNewTransactionChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoriaId">Categoria</Label>
                      <Select
                        value={newTransaction.categoriaId ? newTransaction.categoriaId.toString() : ''}
                        onValueChange={(value) => setNewTransaction(prev => ({ ...prev, categoriaId: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map(cat => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Cadastrar Gasto
                  </Button>
                </form>
              </AnimatedCardContent>
            </AnimatedCard>
          </TabsContent>

          <TabsContent value="gerenciar-cartoes" className="space-y-6">
            <AnimatedCard delay={0.1}>
              <AnimatedCardHeader>
                <AnimatedCardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Cadastrar Novo Cartão
                </AnimatedCardTitle>
              </AnimatedCardHeader>
              <AnimatedCardContent>
                <form onSubmit={handleCreateCard} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome do Cartão</Label>
                      <Input id="nome" value={newCard.nome} onChange={handleNewCardChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="limite">Limite</Label>
                      <Input id="limite" type="number" step="0.01" value={newCard.limite} onChange={handleNewCardChange} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="diaFechamento">Dia de Fechamento da Fatura</Label>
                      <Input id="diaFechamento" type="number" min="1" max="31" value={newCard.diaFechamento} onChange={handleNewCardChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="diaVencimento">Dia de Vencimento da Fatura</Label>
                      <Input id="diaVencimento" type="number" min="1" max="31" value={newCard.diaVencimento} onChange={handleNewCardChange} required />
                    </div>
                  </div>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Cadastrar Cartão
                  </Button>
                </form>
              </AnimatedCardContent>
            </AnimatedCard>

            <AnimatedCard delay={0.2}>
              <AnimatedCardHeader>
                <AnimatedCardTitle>Meus Cartões</AnimatedCardTitle>
              </AnimatedCardHeader>
              <AnimatedCardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Limite</TableHead>
                      <TableHead>Fechamento</TableHead>
                      <TableHead>Vencimento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartoes.map(card => (
                      <TableRow key={card.id}>
                        <TableCell className="font-medium">{card.nome}</TableCell>
                        <TableCell>{formatCurrency(card.limite)}</TableCell>
                        <TableCell>Dia {card.diaFechamento}</TableCell>
                        <TableCell>Dia {card.diaVencimento}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AnimatedCardContent>
            </AnimatedCard>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CartaoCredito;
