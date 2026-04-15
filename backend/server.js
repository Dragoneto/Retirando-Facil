require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/config/db.js');
const productRoutes = require('./src/routes/productRoutes');
const scheduleRoutes = require('./src/routes/scheduleRoutes');
const orderRoutes = require('./src/routes/orderRoutes.js');

const app = express();

app.use(cors({
  origin: ['https://retirando-facil.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use('/api', productRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', orderRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API do Retira-Fácil está funcionando!' });
});

const PORT = process.env.API_PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});