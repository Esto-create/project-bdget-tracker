// server.js
import express from 'express';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Routes
import AuthRoutes from './routes/AuthRoutes.js';
import FundsRoutes from './routes/FundsRoutes.js';
import InvestmentRoutes from './routes/InvestmentRoutes.js';
import DashboardRoutes from './routes/DashboardRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // for parsing application/json

// --- Static Files ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// --- API Routes ---
app.use('/api/auth', AuthRoutes);
app.use('/api/funds', FundsRoutes);
app.use('/api/investment', InvestmentRoutes);
app.use('/api/dashboard', DashboardRoutes);

// Catch-all to serve index.html for any frontend route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
