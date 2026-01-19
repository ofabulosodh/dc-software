require('dotenv').config();

const express = require('express');
const cors = require('cors');

const auraRoutes = require('./routes/aura.routes');
const contatoRoutes = require('./routes/contato.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN,
  methods: ['GET', 'POST'],
}));
app.use(express.json());

// Rotas
app.use('/aura', auraRoutes);
app.use('/contato', contatoRoutes);

// Health check (produção)
app.get('/health', (req, res) => {
  res.status(200).send('ok');
});

// Rota raiz
app.get('/', (req, res) => {
  res.send('Aura backend está vivo 🚀');
});

// Start server
app.listen(PORT, () => {
  console.log(`Servidor Aura rodando na porta ${PORT}`);
});


