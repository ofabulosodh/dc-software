require('dotenv').config();

const express = require('express');
const cors = require('cors');

const auraRoutes = require('./routes/aura.routes');
const contatoRoutes = require('./routes/contato.routes');

const app = express();
const PORT = process.env.PORT || 3000;

const allowed = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // permite requests sem origin (curl/postman)
    if (!origin) return cb(null, true);
    if (allowed.includes(origin)) return cb(null, true);
    return cb(new Error("CORS blocked: " + origin));
  },
  methods: ["GET", "POST"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



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



