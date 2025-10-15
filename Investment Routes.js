// routes/InvestmentRoutes.js
import express from 'express';
import InvestmentModel from '../models/InvestmentModel.js';
import FundsModel from '../models/FundsModel.js'; 
import authenticateToken from '../middleware/auth.js'; 

const router = express.Router();

/**
 * GET /api/investment/types
 * Fetches all available investment types. Requires authentication.
 */
router.get('/types', authenticateToken, async (req, res) => {
    try {
        const types = await InvestmentModel.getInvestmentTypes();
        res.status(200).json(types);
    } catch (error) {
        console.error('Error fetching investment types:', error);
        res.status(500).json({ message: "Failed to retrieve investment types." });
    }
});

/**
 * POST /api/investment/choose
 * Records the user's choice to allocate funds to an investment type AND deducts the amount.
 * Body: { type_id, allocated_fund, fund_id } 
 */
router.post('/choose', authenticateToken, async (req, res) => {
    const { type_id, allocated_fund, fund_id } = req.body; 
    const personId = req.personId; 
    
    if (!type_id || !allocated_fund || !fund_id) {
        return res.status(400).json({ message: "Missing required investment details (type_id, allocated_fund, or fund_id)." });
    }

    const amount = parseFloat(allocated_fund);
    
    try {
        // Step 1: Record the investment choice in the Investments table
        const investmentId = await InvestmentModel.recordInvestmentChoice(
            personId, 
            type_id, 
            amount
        );

        // Step 2: Record the withdrawal (as an EXPENSE) from the source fund
        // This transaction updates the fund's current_balance.
        await FundsModel.recordTransaction(
            parseInt(fund_id), 
            'EXPENSE', // Investment allocation is an expense/transfer out
            amount, 
            'Investment', // Category for the transaction
            new Date().toISOString().split('T')[0], // Today's date
            `Allocation to Investment ID ${investmentId} (${type_id})`
        );

        res.status(201).json({ 
            message: `Investment choice recorded and $${amount.toFixed(2)} deducted from fund.`,
            investmentId: investmentId 
        });
    } catch (error) {
        console.error('Error recording investment:', error);
        res.status(500).json({ message: "Failed to record investment choice and deduct funds. Check if the fund has sufficient balance." });
    }
});

export default router;
