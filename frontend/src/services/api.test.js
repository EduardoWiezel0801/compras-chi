import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchStats, fetchOrders, fetchSuppliers, fetchDeliveries } from './api'

// Mock do fetch global
global.fetch = vi.fn()

describe('API Service', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('fetchStats', () => {
    it('deve buscar estatísticas com sucesso', async () => {
      const mockStats = {
        previsto_hoje: 5,
        atrasada: 8,
        previsto_amanha: 3,
        finalizado: 4,
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      })

      const result = await fetchStats()

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/stats/')
      expect(result).toEqual(mockStats)
    })

    it('deve lançar erro quando a requisição falha', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      await expect(fetchStats()).rejects.toThrow('Erro ao buscar estatísticas: 500')
    })

    it('deve lançar erro quando há erro de rede', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(fetchStats()).rejects.toThrow('Network error')
    })
  })

  describe('fetchOrders', () => {
    it('deve buscar pedidos com parâmetros padrão', async () => {
      const mockOrders = {
        count: 10,
        results: [
          {
            id: 1,
            number: 'PC2024001',
            supplier: { code: 'FOR001', name: 'Fornecedor A' },
          },
        ],
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrders,
      })

      const result = await fetchOrders()

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/orders/?page=1')
      expect(result).toEqual(mockOrders)
    })

    it('deve buscar pedidos com filtros', async () => {
      const filters = {
        page: 2,
        status: 'PENDENTE',
        supplier: 'FOR001',
        storage: '01',
        search: 'PC2024',
        date: 'today',
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ count: 0, results: [] }),
      })

      await fetchOrders(filters)

      const expectedUrl = 'http://localhost:8000/api/orders/?page=2&status=PENDENTE&supplier=FOR001&storage=01&search=PC2024&date=today'
      expect(fetch).toHaveBeenCalledWith(expectedUrl)
    })

    it('deve ignorar filtros vazios', async () => {
      const filters = {
        page: 1,
        status: '',
        supplier: null,
        storage: undefined,
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ count: 0, results: [] }),
      })

      await fetchOrders(filters)

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/orders/?page=1')
    })

    it('deve lançar erro quando a requisição falha', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      await expect(fetchOrders()).rejects.toThrow('Erro ao buscar pedidos: 404')
    })
  })

  describe('fetchSuppliers', () => {
    it('deve buscar fornecedores com sucesso', async () => {
      const mockSuppliers = [
        { code: 'FOR001', name: 'Fornecedor A' },
        { code: 'FOR002', name: 'Fornecedor B' },
      ]

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuppliers,
      })

      const result = await fetchSuppliers()

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/suppliers/')
      expect(result).toEqual(mockSuppliers)
    })

    it('deve lançar erro quando a requisição falha', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      })

      await expect(fetchSuppliers()).rejects.toThrow('Erro ao buscar fornecedores: 403')
    })
  })

  describe('fetchDeliveries', () => {
    it('deve buscar recebimentos com sucesso', async () => {
      const mockDeliveries = [
        {
          id: 1,
          purchase_order: { number: 'PC2024001' },
          delivery_date: '2024-07-07',
          quantity_received: 10,
          status: 'FINALIZADO',
        },
      ]

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDeliveries,
      })

      const result = await fetchDeliveries()

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/deliveries/')
      expect(result).toEqual(mockDeliveries)
    })

    it('deve lançar erro quando a requisição falha', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      })

      await expect(fetchDeliveries()).rejects.toThrow('Erro ao buscar recebimentos: 400')
    })
  })

  describe('Tratamento de erros de rede', () => {
    it('deve lidar com timeout', async () => {
      fetch.mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      )

      await expect(fetchStats()).rejects.toThrow('Timeout')
    })

    it('deve lidar com erro de CORS', async () => {
      fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))

      await expect(fetchStats()).rejects.toThrow('Failed to fetch')
    })

    it('deve lidar com resposta JSON inválida', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      })

      await expect(fetchStats()).rejects.toThrow('Invalid JSON')
    })
  })

  describe('Headers e configurações', () => {
    it('deve incluir headers corretos nas requisições', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      await fetchStats()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/stats/',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('deve usar método GET por padrão', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      await fetchStats()

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'GET',
        })
      )
    })
  })

  describe('Cache e performance', () => {
    it('deve fazer requisições independentes para diferentes endpoints', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })

      await Promise.all([
        fetchStats(),
        fetchOrders(),
        fetchSuppliers(),
        fetchDeliveries(),
      ])

      expect(fetch).toHaveBeenCalledTimes(4)
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/stats/')
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/orders/?page=1')
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/suppliers/')
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/deliveries/')
    })
  })
})

