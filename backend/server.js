require('dotenv').config();

const express = require('express');
const cors = require('cors');


const auraRoutes = require('./routes/aura.routes');



const app = express();
const PORT = process.env.PORT || 3000;


// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/aura', auraRoutes);

// Rota teste
app.get('/', (req, res) => {
  res.send('Aura backend está vivo 🚀');
});



const contatoRoutes = require('./routes/contato.routes');
app.use('/contato', contatoRoutes);


// Start server
app.listen(PORT, () => {
  console.log(`Servidor Aura rodando em http://localhost:${PORT}`);
});

