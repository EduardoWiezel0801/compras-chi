# Sistema de Pedidos de Compra Chiaperini

## Visão Geral

Sistema moderno para monitoramento de pedidos de compra previstos, desenvolvido com Django (backend) e React (frontend). Esta aplicação substitui o sistema PHP original com uma arquitetura moderna, design responsivo e funcionalidade offline.

## Características Principais

### 🚀 Tecnologias Modernas
- **Backend**: Django 5.2 + Django REST Framework
- **Frontend**: React 18 + TypeScript + SCSS
- **Banco de Dados**: SQLite (facilmente migrável para PostgreSQL/MySQL)
- **Estilização**: Tailwind CSS + SCSS modular
- **Animações**: Framer Motion

### 📱 Design Responsivo
- Interface adaptável para desktop, tablet e mobile
- Breakpoints otimizados para diferentes resoluções
- Componentes modulares e reutilizáveis

### 🔄 Funcionalidade Offline
- Service Worker para cache inteligente
- Sincronização automática quando a rede retorna
- Fallback para dados em cache
- Indicadores visuais de status da conexão

### 📊 Dashboard Interativo
- Cards de estatísticas em tempo real
- Filtros avançados por status, fornecedor e armazém
- Busca em tempo real
- Paginação moderna
- Auto-refresh configurável

## Estrutura do Projeto

```
pedidos-compra-app/
├── backend/                 # Django API
│   ├── backend/            # Configurações do projeto
│   ├── orders/             # App principal
│   │   ├── models.py       # Modelos de dados
│   │   ├── serializers.py  # Serializers da API
│   │   ├── views.py        # Views da API
│   │   └── urls.py         # URLs da API
│   ├── manage.py           # Comando Django
│   └── populate_data.py    # Script para dados de exemplo
├── frontend/               # React App
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   │   ├── Header/     # Cabeçalho
│   │   │   ├── Dashboard/  # Dashboard de estatísticas
│   │   │   ├── OrderTable/ # Tabela de pedidos
│   │   │   └── Pagination/ # Paginação
│   │   ├── hooks/          # Hooks customizados
│   │   ├── services/       # Serviços de API e cache
│   │   └── utils/          # Utilitários offline
│   ├── public/
│   │   └── sw.js           # Service Worker
│   └── dist/               # Build de produção
└── venv/                   # Ambiente virtual Python
```

## Instalação e Configuração

### Pré-requisitos
- Python 3.11+
- Node.js 18+
- pnpm (ou npm)

### Backend (Django)

1. **Criar ambiente virtual**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows
```

2. **Instalar dependências**:
```bash
pip install django djangorestframework django-cors-headers
```

3. **Executar migrações**:
```bash
python manage.py makemigrations
python manage.py migrate
```

4. **Popular dados de exemplo**:
```bash
python populate_data.py
```

5. **Iniciar servidor**:
```bash
python manage.py runserver 0.0.0.0:8000
```

### Frontend (React)

1. **Instalar dependências**:
```bash
cd frontend
pnpm install
```

2. **Iniciar desenvolvimento**:
```bash
pnpm run dev --host
```

3. **Build de produção**:
```bash
pnpm run build
```

## API Endpoints

### Estatísticas
- `GET /api/stats/` - Estatísticas do dashboard

### Pedidos de Compra
- `GET /api/orders/` - Lista paginada de pedidos
- `GET /api/orders/?status=PENDENTE` - Filtrar por status
- `GET /api/orders/?supplier=FOR001` - Filtrar por fornecedor
- `GET /api/orders/?date=today` - Filtrar por data (today, tomorrow, delayed)

### Fornecedores
- `GET /api/suppliers/` - Lista de fornecedores

### Recebimentos
- `GET /api/deliveries/` - Lista de recebimentos

### Health Check
- `GET /api/health/` - Status da API

## Funcionalidades

### Dashboard
- **Pendente Hoje**: Pedidos com previsão para hoje
- **Atrasado**: Pedidos com previsão vencida
- **Previsto Amanhã**: Pedidos com previsão para amanhã
- **Recebimentos Concluídos**: Entregas finalizadas hoje

### Tabela de Pedidos
- **Busca**: Por número do pedido ou nome do fornecedor
- **Filtros**: Status, fornecedor, armazém
- **Ordenação**: Por qualquer coluna clicável
- **Paginação**: Navegação entre páginas
- **Responsiva**: Adaptável a diferentes telas

### Funcionalidade Offline
- **Cache Automático**: Dados são salvos automaticamente
- **Sincronização**: Atualização quando a rede retorna
- **Indicadores**: Status visual da conexão
- **Fallback**: Dados em cache quando offline

## Personalização

### Cores e Temas
As cores podem ser personalizadas editando as variáveis CSS em `src/App.css`:

```css
:root {
  --primary: oklch(0.205 0 0);
  --secondary: oklch(0.97 0 0);
  /* ... outras variáveis */
}
```

### Intervalos de Atualização
Configure os intervalos no arquivo `src/App.jsx`:

```javascript
// Auto-refresh do dashboard (15 segundos)
const { data: stats } = useStats({ refreshInterval: 15000 });

// Auto-refresh da tabela (30 segundos)
const { data: orders } = useOrders({ page: currentPage }, { refreshInterval: 30000 });
```

### Paginação
Altere a quantidade de itens por página em `backend/backend/settings.py`:

```python
REST_FRAMEWORK = {
    'PAGE_SIZE': 11  # Altere conforme necessário
}
```

## Deployment

### Desenvolvimento
1. Inicie o backend: `python manage.py runserver 0.0.0.0:8000`
2. Inicie o frontend: `pnpm run dev --host`
3. Acesse: `http://localhost:5173`

### Produção
1. Build do frontend: `pnpm run build`
2. Configure servidor web (nginx/apache) para servir arquivos estáticos
3. Configure Django para produção (DEBUG=False, ALLOWED_HOSTS, etc.)
4. Use servidor WSGI (gunicorn, uwsgi) para o Django

## Migração do Sistema Original

### Dados
Para migrar dados do sistema PHP original:

1. **Adapte o script `populate_data.py`** para ler do banco Oracle
2. **Configure conexão Oracle** no Django (instale `cx_Oracle`)
3. **Execute migração** dos dados existentes

### Configurações
- **URLs da API**: Atualize em `src/services/api.js`
- **Intervalos**: Ajuste conforme necessário
- **Campos**: Adicione campos específicos nos modelos Django

## Troubleshooting

### Problemas Comuns

1. **CORS Error**: Verifique se `django-cors-headers` está configurado
2. **Service Worker**: Limpe cache do navegador se houver problemas
3. **API não responde**: Verifique se o Django está rodando na porta 8000
4. **Build falha**: Verifique se todas as dependências estão instaladas

### Logs
- **Django**: Logs aparecem no terminal do servidor
- **React**: Logs no console do navegador (F12)
- **Service Worker**: Aba Application > Service Workers no DevTools

## Suporte

Para suporte técnico ou dúvidas sobre implementação, consulte:
- Documentação do Django: https://docs.djangoproject.com/
- Documentação do React: https://react.dev/
- Issues do projeto: [Criar issue no repositório]

## Licença

Este projeto é proprietário da Chiaperini. Todos os direitos reservados.

