# Quadra Futsal Manager

Sistema completo para gerenciamento de quadras de futsal com agendamento online, pagamentos e controle de clientes.

## Funcionalidades

- **Cadastro de Usuários**: Sistema de autenticação com perfis admin e cliente
- **Gestão de Quadras**: Cadastro e gerenciamento de múltiplas quadras
- **Agendamento Online**: Sistema completo de reserva de horários
- **Pagamentos**: Integração com gateways de pagamento (Stripe/Mercado Pago)
- **Painel Administrativo**: Controle total sobre usuários e agendamentos
- **Verificação de Disponibilidade**: Tempo real de horários disponíveis

## Tecnologias

### Backend
- Node.js + Express
- MongoDB com Mongoose
- JWT para autenticação
- Helmet, CORS, Rate Limiting

### Frontend
- React + Vite
- TailwindCSS
- Axios para requisições

## Instalação

### Pré-requisitos
- Node.js 16+
- MongoDB
- npm ou yarn

### Backend
```bash
cd server
npm install
cp .env.example .env
# Configure suas variáveis de ambiente no .env
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

### Rodar ambos os serviços
```bash
npm run dev
```

## Estrutura do Projeto

```
quadra-futsal-manager/
|-- server/
|   |-- models/          # Models do MongoDB
|   |-- routes/          # Rotas da API
|   |-- middleware/      # Middleware personalizados
|   |-- server.js        # Arquivo principal do servidor
|-- client/              # Aplicação React
|-- .env.example         # Exemplo de variáveis de ambiente
|-- package.json         # Dependências e scripts
```

## API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login

### Quadras
- `GET /api/courts` - Listar quadras
- `POST /api/courts` - Criar quadra (admin)
- `PUT /api/courts/:id` - Atualizar quadra (admin)

### Agendamentos
- `GET /api/bookings/my` - Meus agendamentos
- `POST /api/bookings` - Criar agendamento
- `GET /api/bookings/availability` - Verificar disponibilidade

### Pagamentos
- `POST /api/payments/process` - Processar pagamento
- `GET /api/payments/my` - Histórico de pagamentos

## Configuração

1. Configure o MongoDB no `.env`
2. Defina uma chave JWT segura
3. Configure os gateways de pagamento (opcional)

## Deploy

### Backend (Heroku/Render)
- Configure variáveis de ambiente
- Conecte ao MongoDB Atlas
- Build command: `npm install`

### Frontend (Vercel/Netlify)
- Build command: `cd client && npm run build`
- Configure API URL nas variáveis de ambiente

## Contribuição

1. Fork o projeto
2. Crie uma branch feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

MIT License
