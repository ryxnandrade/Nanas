const API_BASE_URL = 'http://localhost:8080/api';

class ApiService {
  constructor( ) {
    this.baseURL = API_BASE_URL;
    this.userId = null;
  }

  setUserId(userId) {
    this.userId = userId;
  }

  clearUserId() {
    this.userId = null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.userId) {
      headers['user_id'] = this.userId;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `HTTP error! status: ${response.status}`);
      }

      // Se a resposta for 204 (No Content), retorna null
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(idToken, name) {
    const userData = await this.request('/auth/verify-token', {
      method: 'POST',
      body: JSON.stringify({ idToken, name }),
    });
    
    if (userData && userData.firebaseUid) {
      this.setUserId(userData.firebaseUid);
    }
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
    return this.request('/carteiras');
  }

  async getCarteira(id) {
    return this.request(`/carteiras/${id}`);
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
  async getDashboardData() {
    try {
      const [carteiras, transacoes, categorias] = await Promise.all([
        this.getCarteiras(),
        this.getTransacoes(),
        this.getCategorias(),
      ]);

      // Calcular estatísticas
      const saldoTotal = carteiras.reduce((total, carteira) => total + carteira.saldo, 0);
      const receitas = transacoes
        .filter(t => t.tipo === 'RECEITA')
        .reduce((total, t) => total + t.valor, 0);
      const despesas = transacoes
        .filter(t => t.tipo === 'DESPESA')
        .reduce((total, t) => total + t.valor, 0);

      // Transações recentes (últimas 10)
      const transacoesRecentes = transacoes
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .slice(0, 10);

      // Estatísticas por categoria
      const categoriaStats = categorias.map(categoria => {
        const transacoesCategoria = transacoes.filter(t => t.categoriaId === categoria.id);
        const total = transacoesCategoria.reduce((sum, t) => sum + t.valor, 0);
        return {
          ...categoria,
          total,
          transacoes: transacoesCategoria.length
        };
      });

      return {
        saldoTotal,
        receitas,
        despesas,
        transacoesRecentes,
        carteiras,
        categorias: categoriaStats
      };
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      throw error;
    }
  }
}

export default new ApiService();
