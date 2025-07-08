# Guia de Testes - Sistema Pedidos de Compra

## Visão Geral

Este documento descreve como executar e interpretar os testes do sistema de pedidos de compra Chiaperini.

## Estrutura de Testes

### Backend (Django)
```
backend/
├── orders/tests.py          # Testes principais
├── generate_test_data.py    # Gerador de dados
└── management_commands.py   # Comandos de gerenciamento
```

### Frontend (React)
```
frontend/
├── src/test/setup.js                    # Configuração dos testes
├── src/components/Header/Header.test.jsx # Testes do Header
├── src/components/Dashboard/Dashboard.test.jsx # Testes do Dashboard
├── src/services/api.test.js             # Testes da API
└── vitest.config.js                     # Configuração do Vitest
```

## Executando Testes

### Backend (Django)

**1. Testes Unitários:**
```bash
cd backend
source ../venv/bin/activate
python manage.py test
```

**2. Testes com Verbosidade:**
```bash
python manage.py test --verbosity=2
```

**3. Testes Específicos:**
```bash
# Testar apenas modelos
python manage.py test orders.tests.SupplierModelTest

# Testar apenas APIs
python manage.py test orders.tests.APITestCase

# Testar performance
python manage.py test orders.tests.PerformanceTest
```

**4. Cobertura de Testes:**
```bash
pip install coverage
coverage run --source='.' manage.py test
coverage report
coverage html  # Gera relatório HTML
```

### Frontend (React)

**1. Executar Todos os Testes:**
```bash
cd frontend
pnpm test
```

**2. Executar Testes em Modo Watch:**
```bash
pnpm test --watch
```

**3. Executar Testes Uma Vez:**
```bash
pnpm test:run
```

**4. Interface Gráfica dos Testes:**
```bash
pnpm test:ui
```

**5. Cobertura de Testes:**
```bash
pnpm test:coverage
```

## Geração de Dados de Teste

### Gerador Automático

**1. Dados Completos (Padrão):**
```bash
cd backend
source ../venv/bin/activate
python generate_test_data.py
```

**2. Dados Mínimos:**
```bash
python generate_test_data.py --minimal
```

**3. Manter Dados Existentes:**
```bash
python generate_test_data.py --keep-data
```

**4. Quantidade Personalizada:**
```bash
python generate_test_data.py --orders 100
```

### Comandos de Gerenciamento

**1. Criar Superusuário:**
```bash
python management_commands.py superuser
```

**2. Resetar Banco:**
```bash
python management_commands.py reset
```

**3. Estatísticas:**
```bash
python management_commands.py stats
```

**4. Verificar Saúde:**
```bash
python management_commands.py health
```

**5. Backup/Restore:**
```bash
# Backup
python management_commands.py backup --file backup.json

# Restore
python management_commands.py restore --file backup.json
```

## Tipos de Testes

### 1. Testes Unitários

**Modelos (Models):**
- Criação de objetos
- Validações
- Propriedades calculadas
- Métodos personalizados

**Exemplo:**
```python
def test_purchase_order_is_delayed(self):
    """Testa se pedido está atrasado"""
    po = PurchaseOrder.objects.create(...)
    po.followup_date = date.today() - timedelta(days=1)
    self.assertTrue(po.is_delayed)
```

### 2. Testes de API

**Endpoints:**
- Status codes corretos
- Estrutura de resposta
- Filtros e paginação
- Tratamento de erros

**Exemplo:**
```python
def test_stats_endpoint(self):
    """Testa endpoint de estatísticas"""
    response = self.client.get('/api/stats/')
    self.assertEqual(response.status_code, 200)
    self.assertIn('previsto_hoje', response.json())
```

### 3. Testes de Integração

**Fluxos Completos:**
- Criar fornecedor → pedido → recebimento
- Verificar consistência entre endpoints
- Validar regras de negócio

### 4. Testes de Performance

**Métricas:**
- Tempo de resposta das APIs
- Performance com datasets grandes
- Otimização de queries

### 5. Testes Frontend

**Componentes:**
- Renderização correta
- Interações do usuário
- Estados de loading/erro
- Props e callbacks

**Exemplo:**
```javascript
it('deve chamar onRefresh quando botão é clicado', () => {
  const onRefresh = vi.fn()
  render(<Header onRefresh={onRefresh} />)
  
  fireEvent.click(screen.getByTitle('Atualizar dados'))
  expect(onRefresh).toHaveBeenCalledTimes(1)
})
```

## Cenários de Teste

### Dados Gerados Automaticamente

**1. Fornecedores (15 empresas):**
- Códigos: FOR001 a FOR015
- Nomes realistas de empresas brasileiras
- Status ativo/inativo

**2. Pedidos de Compra (50+ pedidos):**
- Números sequenciais: PC2024001, PC2024002...
- Datas variadas (últimos 60 dias)
- Status distribuídos realisticamente
- Quantidades aleatórias (1-50 itens)

**3. Cenários Específicos:**
- **Hoje**: 5 pedidos com followup hoje
- **Atrasados**: 8 pedidos em atraso
- **Amanhã**: 3 pedidos para amanhã
- **Finalizados**: 4 recebimentos hoje

### Distribuição de Status

- **Pedidos Atrasados**: 70% pendente, 20% parcial, 10% finalizado
- **Pedidos Hoje**: 50% pendente, 30% parcial, 20% finalizado
- **Pedidos Futuros**: 85% pendente, 10% parcial, 5% finalizado

## Validação Manual

### 1. Interface Web

**Dashboard:**
- [ ] Cards mostram valores corretos
- [ ] Cores adequadas (amarelo, vermelho, azul, verde)
- [ ] Responsividade em mobile
- [ ] Animações funcionando

**Tabela:**
- [ ] Paginação funcional
- [ ] Filtros por status/fornecedor/armazém
- [ ] Busca por texto
- [ ] Ordenação por colunas
- [ ] Auto-refresh (15s)

**Funcionalidade Offline:**
- [ ] Funciona sem internet
- [ ] Sincroniza quando volta online
- [ ] Indicador de status correto

### 2. API Endpoints

**Teste Manual:**
```bash
# Estatísticas
curl http://localhost:8000/api/stats/

# Pedidos
curl http://localhost:8000/api/orders/

# Filtros
curl "http://localhost:8000/api/orders/?status=PENDENTE&supplier=FOR001"

# Health check
curl http://localhost:8000/api/health/
```

### 3. Admin Django

**Acesso:** http://localhost:8000/admin
- **Usuário:** admin
- **Senha:** admin123

**Verificações:**
- [ ] Todos os modelos visíveis
- [ ] Filtros funcionando
- [ ] Busca operacional
- [ ] Edição de registros

## Troubleshooting

### Problemas Comuns

**1. Testes Django Falhando:**
```bash
# Verificar migrações
python manage.py makemigrations
python manage.py migrate

# Limpar cache
python manage.py collectstatic --clear
```

**2. Testes React Falhando:**
```bash
# Limpar cache
rm -rf node_modules/.vite
pnpm install

# Verificar dependências
pnpm audit
```

**3. Dados de Teste Inconsistentes:**
```bash
# Resetar e recriar
python management_commands.py reset
python generate_test_data.py
```

**4. Performance Lenta:**
```bash
# Otimizar banco
python management_commands.py optimize

# Verificar saúde
python management_commands.py health
```

### Logs e Debug

**Django:**
```python
# Em views.py ou models.py
import logging
logger = logging.getLogger(__name__)
logger.debug("Debug info")
```

**React:**
```javascript
// No console do navegador
console.log("Debug info")

// React DevTools
// Instalar extensão do navegador
```

## Métricas de Qualidade

### Cobertura de Testes

**Meta:** > 80% de cobertura

**Backend:**
- Modelos: 100%
- Views/APIs: 90%
- Utilitários: 80%

**Frontend:**
- Componentes: 85%
- Serviços: 90%
- Hooks: 80%

### Performance

**APIs:**
- Estatísticas: < 200ms
- Listagem: < 500ms
- Filtros: < 300ms

**Frontend:**
- First Paint: < 1s
- Interactive: < 2s
- Bundle Size: < 500KB

### Qualidade de Código

**Linting:**
```bash
# Backend
flake8 .
black . --check

# Frontend
pnpm lint
```

## Automação

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.11
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests
        run: python manage.py test
  
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: 18
      - name: Install dependencies
        run: pnpm install
      - name: Run tests
        run: pnpm test:run
```

### Scripts de Automação

**test-all.sh:**
```bash
#!/bin/bash
echo "🧪 Executando todos os testes..."

# Backend
cd backend
source ../venv/bin/activate
python manage.py test
backend_status=$?

# Frontend
cd ../frontend
pnpm test:run
frontend_status=$?

# Resultado
if [ $backend_status -eq 0 ] && [ $frontend_status -eq 0 ]; then
    echo "✅ Todos os testes passaram!"
    exit 0
else
    echo "❌ Alguns testes falharam!"
    exit 1
fi
```

## Relatórios

### Relatório de Testes

**Geração Automática:**
```bash
# Backend
python manage.py test --verbosity=2 > test_report.txt

# Frontend
pnpm test:run --reporter=verbose > frontend_test_report.txt
```

### Métricas de Cobertura

**HTML Reports:**
```bash
# Backend
coverage html
# Abrir htmlcov/index.html

# Frontend
pnpm test:coverage
# Abrir coverage/index.html
```

## Conclusão

Este sistema de testes garante:

- ✅ **Qualidade**: Código testado e validado
- ✅ **Confiabilidade**: Funcionalidades verificadas
- ✅ **Manutenibilidade**: Regressões detectadas
- ✅ **Performance**: Métricas monitoradas
- ✅ **Documentação**: Comportamento documentado

Para dúvidas ou problemas, consulte a documentação ou execute os comandos de diagnóstico disponíveis.

