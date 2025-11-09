const API_BASE_URL = 'http://localhost:8080/api';

class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL + '/api';
    this.userId = null;
    this.firebaseUid = null;
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

  clearUserData() {
    this.userId = null;
    this.firebaseUid = null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = { 'Content-Type': 'application/json', ...options.headers };

    if (this.firebaseUid) {
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
    if (!this.firebaseUid) throw new Error("Firebase UID não definido.");
    return this.request('/carteiras'); 
  }

  async getTransacoes() {
    if (!this.firebaseUid) throw new Error("Firebase UID não definido.");
    return this.request('/transacoes');
  }

  async createCarteira(carteiraData) {
    return this.request('/carteiras', {
      method: 'POST',
      body: JSON.stringify(carteiraData),
    });
  }

  async updateCarteira(id, carteiraData) {
    return this.request(`/carteiras/${id}`, {
      method: 'PUT',
      body: JSON.stringify(carteiraData),
    });
  }

  async deleteCarteira(id) {
    return this.request(`/carteiras/${id}`, {
      method: 'DELETE',
    });
  }

  async transferirEntreCarteiras(transferenciaData) {
    return this.request('/carteiras/transferir', {
      method: 'POST',
      body: JSON.stringify(transferenciaData),
    });
  }

  // Categorias endpoints
  async getCategorias() {
    return this.request('/categorias');
  }

  async getCategoria(id) {
    return this.request(`/categorias/${id}`);
  }

  async createCategoria(categoriaData) {
    return this.request('/categorias', {
      method: 'POST',
      body: JSON.stringify(categoriaData),
    });
  }

  async updateCategoria(id, categoriaData) {
    return this.request(`/categorias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoriaData),
    });
  }

  async deleteCategoria(id) {
    return this.request(`/categorias/${id}`, {
      method: 'DELETE',
    });
  }

  // Transações endpoints
  async getTransacoes() {
    return this.request('/transacoes');
  }

  async getTransacao(id) {
    return this.request(`/transacoes/${id}`);
  }

  async createTransacao(transacaoData) {
    return this.request('/transacoes', {
      method: 'POST',
      body: JSON.stringify(transacaoData),
    });
  }

  async updateTransacao(id, transacaoData) {
    return this.request(`/transacoes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transacaoData),
    });
  }

  async deleteTransacao(id) {
    return this.request(`/transacoes/${id}`, {
      method: 'DELETE',
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
}
export default new ApiService();