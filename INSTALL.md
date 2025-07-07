# Guia de Instalação - Sistema Pedidos de Compra Chiaperini

## Instalação Rápida

### 1. Preparar Ambiente

**Windows:**
```cmd
# Instalar Python 3.11+ (https://python.org)
# Instalar Node.js 18+ (https://nodejs.org)
# Instalar Git (https://git-scm.com)

# Verificar instalações
python --version
node --version
npm --version
```

**Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3.11 python3.11-venv nodejs npm git

# macOS (com Homebrew)
brew install python@3.11 node git

# Verificar instalações
python3.11 --version
node --version
npm --version
```

### 2. Baixar e Extrair Projeto

1. Baixe o arquivo `pedidos-compra-app.zip`
2. Extraia em uma pasta de sua escolha
3. Abra terminal/prompt na pasta extraída

### 3. Configurar Backend (Django)

```bash
# Navegar para pasta do backend
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependências
pip install -r ../requirements.txt

# Executar migrações
python manage.py makemigrations
python manage.py migrate

# Popular dados de exemplo
python populate_data.py

# Criar superusuário (opcional)
python manage.py createsuperuser
```

### 4. Configurar Frontend (React)

```bash
# Abrir novo terminal na pasta raiz do projeto
cd frontend

# Instalar pnpm (se não tiver)
npm install -g pnpm

# Instalar dependências
pnpm install
```

### 5. Executar Aplicação

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows
python manage.py runserver 0.0.0.0:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
pnpm run dev --host
```

### 6. Acessar Sistema

- **Frontend**: http://localhost:5173
- **API Admin**: http://localhost:8000/admin
- **API Docs**: http://localhost:8000/api

## Configuração para Produção

### 1. Build do Frontend

```bash
cd frontend
pnpm run build
```

### 2. Configurar Django para Produção

Edite `backend/backend/settings.py`:

```python
# Produção
DEBUG = False
ALLOWED_HOSTS = ['seu-dominio.com', 'localhost']

# Banco de dados (exemplo PostgreSQL)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'pedidos_compra',
        'USER': 'seu_usuario',
        'PASSWORD': 'sua_senha',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Arquivos estáticos
STATIC_ROOT = '/caminho/para/static/'
STATIC_URL = '/static/'
```

### 3. Servidor Web (Nginx + Gunicorn)

**Instalar Gunicorn:**
```bash
pip install gunicorn
```

**Executar com Gunicorn:**
```bash
gunicorn backend.wsgi:application --bind 0.0.0.0:8000
```

**Configuração Nginx:**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    # Frontend (arquivos estáticos)
    location / {
        root /caminho/para/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Admin Django
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Arquivos estáticos Django
    location /static/ {
        alias /caminho/para/static/;
    }
}
```

## Migração de Dados

### Do Sistema PHP Original

1. **Backup do banco Oracle:**
```sql
-- Exportar dados das tabelas principais
SELECT * FROM SC7010 WHERE ...;
SELECT * FROM SA2010 WHERE ...;
-- etc.
```

2. **Adaptar script de migração:**
```python
# Editar backend/migrate_from_oracle.py
import cx_Oracle

# Configurar conexão Oracle
connection = cx_Oracle.connect('user/password@host:port/service')

# Migrar fornecedores
cursor.execute("SELECT C7_FORNECE, A2_NOME FROM SA2010...")
for row in cursor:
    supplier = Supplier.objects.create(
        code=row[0],
        name=row[1]
    )

# Migrar pedidos
# ... código de migração
```

3. **Executar migração:**
```bash
python migrate_from_oracle.py
```

## Personalização

### Alterar Cores/Tema

Edite `frontend/src/App.css`:

```css
:root {
  /* Cores primárias */
  --primary: oklch(0.205 0 0);        /* Azul escuro */
  --secondary: oklch(0.97 0 0);       /* Cinza claro */
  
  /* Cores dos cards */
  --warning: oklch(0.646 0.222 41.116);   /* Amarelo */
  --danger: oklch(0.577 0.245 27.325);    /* Vermelho */
  --info: oklch(0.6 0.118 184.704);       /* Azul */
  --success: oklch(0.828 0.189 84.429);   /* Verde */
}
```

### Alterar Logo

1. Substitua o arquivo `frontend/public/logo.png`
2. Edite `frontend/src/components/Header/Header.jsx`:

```jsx
<div className="header__logo">
  <img src="/logo.png" alt="Logo" />
</div>
```

### Configurar Auto-refresh

Edite `frontend/src/App.jsx`:

```jsx
// Intervalo do dashboard (milissegundos)
const { data: stats } = useStats({ refreshInterval: 15000 }); // 15 segundos

// Intervalo da tabela
const { data: orders } = useOrders({ page: currentPage }, { refreshInterval: 30000 }); // 30 segundos

// Auto-paginação
useEffect(() => {
  const interval = setInterval(() => {
    // Trocar página a cada 15 segundos
  }, 15000);
}, []);
```

## Troubleshooting

### Problemas Comuns

**1. Erro de CORS:**
```
Access to fetch at 'http://localhost:8000/api/stats/' from origin 'http://localhost:5173' has been blocked by CORS policy
```
**Solução:** Verifique se `django-cors-headers` está instalado e configurado.

**2. Service Worker não funciona:**
```
Failed to register service worker
```
**Solução:** Service Workers só funcionam em HTTPS ou localhost. Em produção, use HTTPS.

**3. Banco de dados não encontrado:**
```
django.db.utils.OperationalError: no such table: orders_purchaseorder
```
**Solução:** Execute as migrações: `python manage.py migrate`

**4. Dependências não encontradas:**
```
ModuleNotFoundError: No module named 'rest_framework'
```
**Solução:** Ative o ambiente virtual e instale dependências: `pip install -r requirements.txt`

**5. Porta já em uso:**
```
Error: That port is already in use.
```
**Solução:** Use porta diferente: `python manage.py runserver 8001` ou mate o processo: `pkill -f runserver`

### Logs e Debug

**Backend (Django):**
```bash
# Logs detalhados
python manage.py runserver --verbosity=2

# Debug no código
import pdb; pdb.set_trace()
```

**Frontend (React):**
```javascript
// Console do navegador (F12)
console.log('Debug info:', data);

// React DevTools (extensão do navegador)
```

**Service Worker:**
```javascript
// DevTools > Application > Service Workers
// DevTools > Application > Storage > Cache Storage
```

## Suporte

### Documentação Oficial
- Django: https://docs.djangoproject.com/
- React: https://react.dev/
- Tailwind CSS: https://tailwindcss.com/

### Comandos Úteis

```bash
# Django
python manage.py shell          # Console Django
python manage.py dbshell        # Console do banco
python manage.py collectstatic  # Coletar arquivos estáticos
python manage.py test           # Executar testes

# React
pnpm run dev                    # Desenvolvimento
pnpm run build                  # Build produção
pnpm run preview                # Preview do build
pnpm run lint                   # Verificar código

# Git
git status                      # Status do repositório
git add .                       # Adicionar mudanças
git commit -m "mensagem"        # Commit
git push                        # Enviar para repositório
```

### Estrutura de Arquivos Importantes

```
pedidos-compra-app/
├── backend/
│   ├── backend/settings.py     # Configurações Django
│   ├── orders/models.py        # Modelos de dados
│   ├── orders/views.py         # Lógica da API
│   └── db.sqlite3             # Banco de dados
├── frontend/
│   ├── src/App.jsx            # Componente principal
│   ├── src/services/api.js    # Configuração da API
│   ├── public/sw.js           # Service Worker
│   └── dist/                  # Build de produção
├── README.md                  # Documentação principal
├── INSTALL.md                 # Este arquivo
└── requirements.txt           # Dependências Python
```

