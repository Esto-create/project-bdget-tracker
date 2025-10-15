// routes/FundsRoutes.js
import express from 'express';
import FundsModel from '../models/FundsModel.js';
import authenticateToken from '../middleware/auth.js'; 

const router = express.Router();

/**
 * POST /api/funds/create
 * Creates a new fund (wallet). Requires authentication.
 */
router.post('/create', authenticateToken, async (req, res) => {
    const { fund_name, fund_type, initial_balance } = req.body;
    const personId = req.personId; 
    
    if (!fund_name || !fund_type || initial_balance === undefined) {
        return res.status(400).json({ message: "Missing fund details." });
    }

    try {
        const fundId = await FundsModel.createFund(personId, fund_name, fund_type, parseFloat(initial_balance));
        res.status(201).json({ message: "Fund created successfully.", fundId });
    } catch (error) {
        console.error('Fund creation error:', error);
        res.status(500).json({ message: "Failed to create fund." });
    }
});

/**
 * GET /api/funds/wallets
 * Fetches all funds (wallets) for the authenticated user.
 */
router.get('/wallets', authenticateToken, async (req, res) => {
    try {
        const funds = await FundsModel.getUserFunds(req.personId);
        res.status(200).json(funds);
    } catch (error) {
        console.error('Error fetching user funds:', error);
        res.status(500).json({ message: "Failed to retrieve funds." });
    }
});

/**
 * POST /api/funds/transaction
 * Records a new transaction (INCOME or EXPENSE) and updates the fund balance.
 */
router.post('/transaction', authenticateToken, async (req, res) => {
    const { fund_id, type, amount, category, date, description } = req.body;

    if (!fund_id || !type || !amount || !category || !date) {
        return res.status(400).json({ message: "Missing transaction details." });
    }
    
    // Ensure amount is positive
    const parsedAmount = Math.abs(parseFloat(amount));

    try {
        const transactionId = await FundsModel.recordTransaction(
            parseInt(fund_id), 
            type.toUpperCase(), 
            parsedAmount, 
            category, 
            date, 
            description || null
        );
        res.status(201).json({ message: `${type} transaction recorded successfully.`, transactionId });
    } catch (error) {
        console.error('Transaction error:', error);
        res.status(500).json({ message: "Failed to record transaction." });
    }
});

/**
 * POST /api/funds/budget
 * Sets a new monthly budget for a category.
 */
router.post('/budget', authenticateToken, async (req, res) => {
    const { category, month, allocated_amount } = req.body;
    const personId = req.personId;

    if (!category || !month || allocated_amount === undefined) {
        return res.status(400).json({ message: "Missing budget details." });
    }

    try {
        await FundsModel.setBudget(personId, category, month, parseFloat(allocated_amount));
        res.status(201).json({ message: "Budget set or updated successfully." });
    } catch (error) {
        console.error('Budget setting error:', error);
        res.status(500).json({ message: "Failed to set budget." });
    }
});


export default router;
