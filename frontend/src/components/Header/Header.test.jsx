import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Header from './Header'

// Mock do componente de ícone
vi.mock('lucide-react', () => ({
  RefreshCw: ({ className, ...props }) => <div data-testid="refresh-icon" className={className} {...props} />,
  Wifi: ({ className, ...props }) => <div data-testid="wifi-icon" className={className} {...props} />,
  WifiOff: ({ className, ...props }) => <div data-testid="wifi-off-icon" className={className} {...props} />,
}))

describe('Header', () => {
  const defaultProps = {
    isOnline: true,
    onRefresh: vi.fn(),
    isRefreshing: false,
    currentPage: 1,
    totalPages: 3,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar o título corretamente', () => {
    render(<Header {...defaultProps} />)
    
    expect(screen.getByText('CHIAPERINI')).toBeInTheDocument()
    expect(screen.getByText('PEDIDOS DE COMPRA PREVISTOS')).toBeInTheDocument()
  })

  it('deve mostrar status online quando conectado', () => {
    render(<Header {...defaultProps} />)
    
    expect(screen.getByText('Online')).toBeInTheDocument()
    expect(screen.getByTestId('wifi-icon')).toBeInTheDocument()
  })

  it('deve mostrar status offline quando desconectado', () => {
    render(<Header {...defaultProps} isOnline={false} />)
    
    expect(screen.getByText('Offline')).toBeInTheDocument()
    expect(screen.getByTestId('wifi-off-icon')).toBeInTheDocument()
  })

  it('deve mostrar informações de paginação', () => {
    render(<Header {...defaultProps} />)
    
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
  })

  it('deve chamar onRefresh quando botão de refresh é clicado', () => {
    const onRefresh = vi.fn()
    render(<Header {...defaultProps} onRefresh={onRefresh} />)
    
    const refreshButton = screen.getByTitle('Atualizar dados')
    fireEvent.click(refreshButton)
    
    expect(onRefresh).toHaveBeenCalledTimes(1)
  })

  it('deve desabilitar botão de refresh quando está atualizando', () => {
    render(<Header {...defaultProps} isRefreshing={true} />)
    
    const refreshButton = screen.getByTitle('Atualizar dados')
    expect(refreshButton).toBeDisabled()
  })

  it('deve aplicar classe de loading no ícone quando está atualizando', () => {
    render(<Header {...defaultProps} isRefreshing={true} />)
    
    const refreshIcon = screen.getByTestId('refresh-icon')
    expect(refreshIcon).toHaveClass('animate-spin')
  })

  it('deve renderizar sem informações de paginação quando não fornecidas', () => {
    const propsWithoutPagination = {
      ...defaultProps,
      currentPage: undefined,
      totalPages: undefined,
    }
    
    render(<Header {...propsWithoutPagination} />)
    
    expect(screen.queryByText(/Página/)).not.toBeInTheDocument()
  })

  it('deve aplicar classes CSS corretas', () => {
    const { container } = render(<Header {...defaultProps} />)
    
    const header = container.querySelector('.header')
    expect(header).toBeInTheDocument()
    expect(header).toHaveClass('header')
  })

  it('deve mostrar indicador de status correto baseado na conexão', () => {
    const { rerender } = render(<Header {...defaultProps} isOnline={true} />)
    
    let statusIndicator = screen.getByText('Online').closest('.header__status')
    expect(statusIndicator).toHaveClass('header__status--online')
    
    rerender(<Header {...defaultProps} isOnline={false} />)
    
    statusIndicator = screen.getByText('Offline').closest('.header__status')
    expect(statusIndicator).toHaveClass('header__status--offline')
  })
})

