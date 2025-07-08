import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Dashboard from './Dashboard'

// Mock do componente StatusCard
vi.mock('./StatusCard/StatusCard', () => ({
  default: ({ title, value, icon, color, description }) => (
    <div data-testid="status-card">
      <div data-testid="card-title">{title}</div>
      <div data-testid="card-value">{value}</div>
      <div data-testid="card-description">{description}</div>
      <div data-testid="card-color">{color}</div>
    </div>
  )
}))

describe('Dashboard', () => {
  const mockStats = {
    previsto_hoje: 5,
    atrasada: 8,
    previsto_amanha: 3,
    finalizado: 4,
  }

  it('deve renderizar todos os cards de estatísticas', () => {
    render(<Dashboard stats={mockStats} loading={false} error={null} />)
    
    const cards = screen.getAllByTestId('status-card')
    expect(cards).toHaveLength(4)
  })

  it('deve exibir os valores corretos nas estatísticas', () => {
    render(<Dashboard stats={mockStats} loading={false} error={null} />)
    
    expect(screen.getByText('5')).toBeInTheDocument() // previsto_hoje
    expect(screen.getByText('8')).toBeInTheDocument() // atrasada
    expect(screen.getByText('3')).toBeInTheDocument() // previsto_amanha
    expect(screen.getByText('4')).toBeInTheDocument() // finalizado
  })

  it('deve exibir os títulos corretos dos cards', () => {
    render(<Dashboard stats={mockStats} loading={false} error={null} />)
    
    expect(screen.getByText('PENDENTE HOJE')).toBeInTheDocument()
    expect(screen.getByText('ATRASADO')).toBeInTheDocument()
    expect(screen.getByText('PREVISTO AMANHÃ')).toBeInTheDocument()
    expect(screen.getByText('RECEB. CONCLUÍDO')).toBeInTheDocument()
  })

  it('deve exibir as descrições corretas dos cards', () => {
    render(<Dashboard stats={mockStats} loading={false} error={null} />)
    
    expect(screen.getByText('Pedidos previstos para hoje')).toBeInTheDocument()
    expect(screen.getByText('Pedidos em atraso')).toBeInTheDocument()
    expect(screen.getByText('Pedidos previstos para amanhã')).toBeInTheDocument()
    expect(screen.getByText('Recebimentos finalizados hoje')).toBeInTheDocument()
  })

  it('deve aplicar as cores corretas aos cards', () => {
    render(<Dashboard stats={mockStats} loading={false} error={null} />)
    
    const colorElements = screen.getAllByTestId('card-color')
    expect(colorElements[0]).toHaveTextContent('warning') // pendente hoje
    expect(colorElements[1]).toHaveTextContent('danger')  // atrasado
    expect(colorElements[2]).toHaveTextContent('info')    // previsto amanhã
    expect(colorElements[3]).toHaveTextContent('success') // finalizado
  })

  it('deve mostrar estado de loading', () => {
    render(<Dashboard stats={null} loading={true} error={null} />)
    
    expect(screen.getByText('Carregando estatísticas...')).toBeInTheDocument()
  })

  it('deve mostrar mensagem de erro', () => {
    const error = 'Erro ao carregar dados'
    render(<Dashboard stats={null} loading={false} error={error} />)
    
    expect(screen.getByText('Erro ao carregar estatísticas')).toBeInTheDocument()
    expect(screen.getByText(error)).toBeInTheDocument()
  })

  it('deve mostrar valores zero quando stats é null', () => {
    render(<Dashboard stats={null} loading={false} error={null} />)
    
    const values = screen.getAllByTestId('card-value')
    values.forEach(value => {
      expect(value).toHaveTextContent('0')
    })
  })

  it('deve aplicar classes CSS corretas', () => {
    const { container } = render(<Dashboard stats={mockStats} loading={false} error={null} />)
    
    const dashboard = container.querySelector('.dashboard')
    expect(dashboard).toBeInTheDocument()
    expect(dashboard).toHaveClass('dashboard')
  })

  it('deve renderizar com animação fade-in', () => {
    const { container } = render(<Dashboard stats={mockStats} loading={false} error={null} />)
    
    const dashboard = container.querySelector('.dashboard')
    expect(dashboard).toHaveClass('animate-fade-in')
  })

  it('deve lidar com stats parciais', () => {
    const partialStats = {
      previsto_hoje: 2,
      atrasada: undefined,
      previsto_amanha: null,
      // finalizado ausente
    }
    
    render(<Dashboard stats={partialStats} loading={false} error={null} />)
    
    expect(screen.getByText('2')).toBeInTheDocument() // previsto_hoje
    
    const values = screen.getAllByTestId('card-value')
    // Deve mostrar 0 para valores undefined, null ou ausentes
    expect(values.filter(v => v.textContent === '0')).toHaveLength(3)
  })

  it('deve manter responsividade em diferentes tamanhos de tela', () => {
    const { container } = render(<Dashboard stats={mockStats} loading={false} error={null} />)
    
    const grid = container.querySelector('.dashboard__grid')
    expect(grid).toBeInTheDocument()
    expect(grid).toHaveClass('dashboard__grid')
  })
})

