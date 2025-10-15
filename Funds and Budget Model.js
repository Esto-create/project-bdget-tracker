// models/FundsModel.js
import executeQuery from '../db/db.js';

const FundsModel = {
    /**
     * Creates a new fund (wallet) for a user.
     */
    createFund: async (personId, name, type, initialBalance) => {
        // Step 1: Create the fund
        const fundSql = "INSERT INTO Funds (person_id, fund_name, fund_type, current_balance) VALUES (?, ?, ?, ?)";
        const [fundResult] = await executeQuery(fundSql, [personId, name, type, initialBalance]);
        const fundId = fundResult.insertId;

        // Step 2: If initialBalance > 0, record it as an INCOME transaction
        if (initialBalance > 0) {
            const transactionSql = `
                INSERT INTO Transactions (fund_id, type, amount, category, date, description)
                VALUES (?, 'INCOME', ?, 'Initial Deposit', CURDATE(), 'Initial balance deposited on fund creation.')
            `;
            await executeQuery(transactionSql, [fundId, initialBalance]);
        }
        
        return fundId;
    },

    /**
     * Retrieves all funds (wallets) for a specific user.
     */
    getUserFunds: async (personId) => {
        const sql = "SELECT fund_id, fund_name, fund_type, current_balance FROM Funds WHERE person_id = ?";
        const [rows] = await executeQuery(sql, [personId]);
        return rows;
    },

    /**
     * Calculates the sum of all fund balances for a user.
     */
    calculateTotalBalance: async (personId) => {
        const sql = "SELECT SUM(current_balance) AS total FROM Funds WHERE person_id = ?";
        const [rows] = await executeQuery(sql, [personId]);
        return parseFloat(rows[0]?.total) || 0;
    },

    /**
     * Records a new transaction and updates the fund balance.
     */
    recordTransaction: async (fundId, type, amount, category, date, description) => {
        // Step 1: Record the transaction
        const transactionSql = `
            INSERT INTO Transactions (fund_id, type, amount, category, date, description)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [transactionResult] = await executeQuery(transactionSql, [fundId, type, amount, category, date, description]);

        // Step 2: Determine balance update
        const multiplier = (type === 'INCOME') ? 1 : -1;
        const updateAmount = amount * multiplier;

        // Step 3: Update the fund balance
        const updateFundSql = "UPDATE Funds SET current_balance = current_balance + ? WHERE fund_id = ?";
        await executeQuery(updateFundSql, [updateAmount, fundId]);

        return transactionResult.insertId;
    },
    
    /**
     * Retrieves the total income and expenses for the current month.
     */
    getMonthlySummary: async (personId) => {
        const currentMonthStart = new Date().toISOString().slice(0, 7) + '-01'; 
        
        const sql = `
            SELECT 
                T.type, 
                SUM(T.amount) AS total_amount
            FROM Transactions T
            JOIN Funds F ON T.fund_id = F.fund_id
            WHERE F.person_id = ? 
              AND T.date >= ?
            GROUP BY T.type
        `;
        const [rows] = await executeQuery(sql, [personId, currentMonthStart]);

        const summary = {
            monthly_income: 0,
            monthly_expenses: 0
        };

        rows.forEach(row => {
            if (row.type === 'INCOME') {
                summary.monthly_income = parseFloat(row.total_amount);
            } else if (row.type === 'EXPENSE') {
                summary.monthly_expenses = parseFloat(row.total_amount);
            }
        });

        return summary;
    },

    /**
     * Sets or updates a budget for a specific category and month.
     */
    setBudget: async (personId, category, month, allocatedAmount) => {
        const sql = `
            INSERT INTO Budgets (person_id, category, allocated_amount, budget_month)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE allocated_amount = ?
        `;
        const [result] = await executeQuery(sql, [personId, category, allocatedAmount, month, allocatedAmount]);
        return result.insertId || 'Updated';
    },

    /**
     * Retrieves the budget progress (allocated vs. spent) for the current month.
     */
    getBudgetSummary: async (personId, month) => {
        const sql = `
            SELECT 
                B.category,
                B.allocated_amount AS allocated,
                COALESCE(SUM(T.amount), 0) AS spent
            FROM Budgets B
            LEFT JOIN Funds F ON B.person_id = F.person_id
            LEFT JOIN Transactions T ON F.fund_id = T.fund_id 
                AND T.category = B.category 
                AND T.type = 'EXPENSE' 
                AND T.date >= B.budget_month 
                AND T.date < DATE_ADD(B.budget_month, INTERVAL 1 MONTH)
            WHERE B.person_id = ? AND B.budget_month = ?
            GROUP BY B.category, B.allocated_amount
            ORDER BY B.category
        `;
        const [rows] = await executeQuery(sql, [personId, month]);
        return rows.map(row => ({
            ...row,
            allocated: parseFloat(row.allocated),
            spent: parseFloat(row.spent)
        }));
    }
};

export default FundsModel;
