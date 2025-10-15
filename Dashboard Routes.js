// routes/DashboardRoutes.js
import express from 'express';
import FundsModel from '../models/FundsModel.js';
import InvestmentModel from '../models/InvestmentModel.js';
import authenticateToken from '../middleware/auth.js'; 

const router = express.Router();

/**
 * GET /api/dashboard
 * Fetches all necessary data for the main dashboard view.
 */
router.get('/', authenticateToken, async (req, res) => {
    const personId = req.personId; 
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01'; // YYYY-MM-01

    try {
        // 1. Total Available Balance
        const totalBalance = await FundsModel.calculateTotalBalance(personId);

        // 2. Monthly Income/Expense Summary
        const monthlySummary = await FundsModel.getMonthlySummary(personId);
        
        // 3. Budget Summary (Progress for current month)
        const budgetSummary = await FundsModel.getBudgetSummary(personId, currentMonth);

        // 4. Budgeting Advice (Mock/Placeholder based on investments)
        const budgetingAdvice = await InvestmentModel.generateBudgetingAdvice(personId);

        res.status(200).json({
            total_balance: totalBalance,
            monthly_summary: monthlySummary,
            budget_summary: budgetSummary,
            budgeting_advice: budgetingAdvice
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ message: "Failed to load dashboard data." });
    }
});

export default router;
