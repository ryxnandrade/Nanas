/**
 * Serviço de API para comunicação com o backend.
 * Gerencia autenticação e requisições HTTP.
 */
class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL + '/api';
    this.userId = null;
    this.firebaseUid = null;
    this.idToken = null; // Token JWT do Firebase
  }

  setUserData(userData) {
    if (userData && userData.id) {
      this.userId = userData.id;
    } else {
      console.error("Falha ao obter o ID numérico do usuário do backend.");
    }

    if (userData && userData.firebaseUid) {
      this.firebaseUid = userData.firebaseUid;
    } else {
      console.error("Falha ao obter o Firebase UID do usuário do backend.");
    }
  }

  setIdToken(token) {
    this.idToken = token;
  }

  clearUserData() {
    this.userId = null;
    this.firebaseUid = null;
    this.idToken = null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = { 'Content-Type': 'application/json', ...options.headers };

    // Adiciona token de autorização se disponível
    if (this.idToken) {
      headers['Authorization'] = `Bearer ${this.idToken}`;
    }

    // Adiciona user_id no header para compatibilidade
    if (options.includeFirebaseUid && this.firebaseUid) {
      headers['user_id'] = this.firebaseUid;
    }

    const config = { ...options, headers };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Falha na requisição para ${endpoint}: ${errorData || response.status}`);
      }
      if (response.status === 204) return null;
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // Auth
  async login(idToken, name) {
    const userData = await this.request('/auth/verify-token', {
      method: 'POST',
      body: JSON.stringify({ idToken, name }),
    });
    this.setUserData(userData);
    return userData;
  }

  async register(email, senha, nome) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, senha, nome }),
    });
  }

  // Carteiras endpoints
  async getCarteiras() {
    return this.request('/carteiras', {
      includeFirebaseUid: true
    });
  }

  async createCarteira(carteiraData) {
    return this.request('/carteiras', {
      method: 'POST',
      body: JSON.stringify(carteiraData),
      includeFirebaseUid: true
    });
  }

  async updateCarteira(id, carteiraData) {
    return this.request(`/carteiras/${id}`, {
      method: 'PUT',
      body: JSON.stringify(carteiraData),
      includeFirebaseUid: true
    });
  }

  async deleteCarteira(id) {
    return this.request(`/carteiras/${id}`, {
      method: 'DELETE',
      includeFirebaseUid: true
    });
  }

  async transferirEntreCarteiras(transferenciaData) {
    return this.request('/carteiras/transferir', {
      method: 'POST',
      body: JSON.stringify(transferenciaData),
      includeFirebaseUid: true
    });
  }

  // Categorias endpoints
  async getCategorias() {
    return this.request('/categorias', {
      includeFirebaseUid: true
    });
  }

  async getCategoria(id) {
    return this.request(`/categorias/${id}`, {
      includeFirebaseUid: true
    });
  }

  async createCategoria(categoriaData) {
    return this.request('/categorias', {
      method: 'POST',
      body: JSON.stringify(categoriaData),
      includeFirebaseUid: true
    });
  }

  async updateCategoria(id, categoriaData) {
    return this.request(`/categorias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoriaData),
      includeFirebaseUid: true
    });
  }

  async deleteCategoria(id) {
    return this.request(`/categorias/${id}`, {
      method: 'DELETE',
      includeFirebaseUid: true
    });
  }

  // Transações endpoints
  async getTransacoes() {
    return this.request('/transacoes', {
      includeFirebaseUid: true
    });
  }

  async getTransacao(id) {
    return this.request(`/transacoes/${id}`, {
      includeFirebaseUid: true
    });
  }

  async createTransacao(transacaoData) {
    return this.request('/transacoes', {
      method: 'POST',
      body: JSON.stringify(transacaoData),
      includeFirebaseUid: true
    });
  }

  async updateTransacao(id, transacaoData) {
    return this.request(`/transacoes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transacaoData),
      includeFirebaseUid: true
    });
  }

  async deleteTransacao(id) {
    return this.request(`/transacoes/${id}`, {
      method: 'DELETE',
      includeFirebaseUid: true
    });
  }


  // Dashboard endpoints
  async getDashboardSummary() {
    if (!this.userId) throw new Error("ID numérico do usuário não definido.");
    return this.request(`/dashboard/summary?usuarioId=${this.userId}`);
  }

  async getDespesasPorCategoria() {
    if (!this.userId) throw new Error("ID numérico do usuário não definido.");
    return this.request(`/dashboard/despesas-por-categoria?usuarioId=${this.userId}`);
  }

  async getEvolucaoSaldo() {
    if (!this.userId) throw new Error("ID numérico do usuário não definido.");
    return this.request(`/dashboard/evolucao-saldo?usuarioId=${this.userId}`);
  }
  // Cartão de Crédito endpoints
  async getCartoesCredito() {
    if (!this.userId) throw new Error("ID numérico do usuário não definido.");
    return this.request(`/cartoes-credito/usuario/${this.userId}`);
  }

  async createCartaoCredito(cartaoCreditoData) {
    if (!this.userId) throw new Error("ID numérico do usuário não definido.");
    const dataToSend = { ...cartaoCreditoData, usuarioId: this.userId };
    return this.request('/cartoes-credito', {
      method: 'POST',
      body: JSON.stringify(dataToSend),
    });
  }

  async getFaturaAtual(cartaoId) {
    if (!this.userId) throw new Error("ID numérico do usuário não definido.");
    return this.request(`/faturas/cartao/${cartaoId}/atual?usuarioId=${this.userId}`);
  }

  async getProximaFatura(cartaoId) {
    if (!this.userId) throw new Error("ID numérico do usuário não definido.");
    return this.request(`/faturas/cartao/${cartaoId}/proxima?usuarioId=${this.userId}`);
  }


  async createTransacaoCartaoCredito(cartaoId, transacaoData) {
    if (!this.userId) throw new Error("ID do usuário não definido.");
    const dataToSend = { ...transacaoData, usuarioId: this.userId };
    return this.request(`/usuarios/${this.userId}/cartoes-credito/${cartaoId}/transacoes`, {
      method: 'POST',
      body: JSON.stringify(dataToSend),
    });
  }
  // -------- METAS ENDPOINTS --------

  async getMetas() {
    if (!this.userId) throw new Error("ID numérico do usuário não definido.");
    return this.request(`/metas?usuarioId=${this.userId}`);
  }

  async getMetasAtivas() {
    if (!this.userId) throw new Error("ID numérico do usuário não definido.");
    return this.request(`/metas/ativas?usuarioId=${this.userId}`);
  }

  async getMeta(id) {
    if (!this.userId) throw new Error("ID numérico do usuário não definido.");
    return this.request(`/metas/${id}?usuarioId=${this.userId}`);
  }

  async createMeta(metaData) {
    if (!this.userId) throw new Error("ID numérico do usuário não definido.");
    return this.request(`/metas?usuarioId=${this.userId}`, {
      method: "POST",
      body: JSON.stringify(metaData),
    });
  }

  async updateMeta(id, metaData) {
    if (!this.userId) throw new Error("ID numérico do usuário não definido.");
    return this.request(`/metas/${id}?usuarioId=${this.userId}`, {
      method: "PUT",
      body: JSON.stringify(metaData),
    });
  }

  async deleteMeta(id) {
    if (!this.userId) throw new Error("ID numérico do usuário não definido.");
    return this.request(`/metas/${id}?usuarioId=${this.userId}`, {
      method: "DELETE",
    });
  }

  async updateStatusMeta(id, ativa) {
    if (!this.userId) throw new Error("ID numérico do usuário não definido.");
    return this.request(`/metas/${id}/status?ativa=${ativa}&usuarioId=${this.userId}`, {
      method: "PATCH",
    });
  }

  // -------- TRANSACOES RECORRENTES --------
  async getTransacoesRecorrentes() {
    if (!this.userId) throw new Error("ID numérico do usuário não definido.");
    return this.request(`/transacoes-recorrentes?usuarioId=${this.userId}`, {
      includeFirebaseUid: true
    });
  }

  async createTransacaoRecorrente(data) {
    if (!this.userId) throw new Error("ID numérico do usuário não definido.");
    return this.request(`/transacoes-recorrentes?usuarioId=${this.userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
      includeFirebaseUid: true
    });
  }

  async updateTransacaoRecorrente(id, data) {
    if (!this.userId) throw new Error("ID numérico do usuário não definido.");
    return this.request(`/transacoes-recorrentes/${id}?usuarioId=${this.userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      includeFirebaseUid: true
    });
  }

  async deleteTransacaoRecorrente(id) {
    if (!this.userId) throw new Error("ID numérico do usuário não definido.");
    return this.request(`/transacoes-recorrentes/${id}?usuarioId=${this.userId}`, {
      method: 'DELETE',
      includeFirebaseUid: true
    });
  }

  async updateStatusTransacaoRecorrente(id, ativa) {
    if (!this.userId) throw new Error("ID numérico do usuário não definido.");
    return this.request(`/transacoes-recorrentes/${id}/status?ativa=${ativa}&usuarioId=${this.userId}`, {
      method: 'PATCH',
      includeFirebaseUid: true
    });
  }

  async executarTransacaoRecorrente(id) {
    if (!this.userId) throw new Error("ID numérico do usuário não definido.");
    return this.request(`/transacoes-recorrentes/${id}/executar?usuarioId=${this.userId}`, {
      method: 'POST',
      includeFirebaseUid: true
    });
  }

  async getInsights() {
    return this.request('/insights', {
      includeFirebaseUid: true
    });
  }

  // -------- RELATÓRIO MENSAL --------
  async getRelatorioMensal(ano, mes) {
    return this.request(`/relatorios/mensal?ano=${ano}&mes=${mes}`, {
      includeFirebaseUid: true
    });
  }

  async getRelatorioMensalAtual() {
    return this.request(`/relatorios/mensal/atual`, {
      includeFirebaseUid: true
    });
  }


}
export default new ApiService();