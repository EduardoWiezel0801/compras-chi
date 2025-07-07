# 🚀 Guia de Início Rápido

## Pré-requisitos
- Python 3.11+
- Node.js 18+
- pnpm (ou npm)

## 1. Configuração do Backend

```bash
# Navegar para o backend
cd backend

# Criar ambiente virtual
python -m venv ../venv
source ../venv/bin/activate  # Linux/Mac
# ou
../venv/Scripts/activate     # Windows

# Instalar dependências
pip install -r ../requirements.txt

# Executar migrações
python manage.py migrate

# Criar superusuário (opcional)
python manage.py createsuperuser

# Gerar dados de teste
python generate_simple.py

# Iniciar servidor
python manage.py runserver
```

## 2. Configuração do Frontend

```bash
# Em outro terminal, navegar para o frontend
cd frontend

# Instalar dependências
pnpm install

# Iniciar desenvolvimento
pnpm dev
```

## 3. Acessar a Aplicação

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Admin Django**: http://localhost:8000/admin

## 4. Executar Testes

### Backend
```bash
cd backend
source ../venv/bin/activate
python manage.py test
```

### Frontend
```bash
cd frontend
pnpm test:run
```

## 5. Comandos Úteis

### Gerar Novos Dados
```bash
cd backend
python generate_simple.py
```

### Build de Produção
```bash
cd frontend
pnpm build
```

### Verificar Saúde do Sistema
```bash
cd backend
python management_commands.py health
```

## 🎯 Pronto!

Sua aplicação está rodando com:
- ✅ 5 fornecedores
- ✅ 20 pedidos de compra
- ✅ 5 recebimentos
- ✅ Interface responsiva
- ✅ Funcionalidade offline
- ✅ Testes implementados

