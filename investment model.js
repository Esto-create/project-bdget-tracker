// models/InvestmentModel.js
import executeQuery from '../db/db.js';

const InvestmentModel = {
    /**
     * Retrieves all available investment types/products.
     */
    getInvestmentTypes: async () => {
        const sql = "SELECT * FROM InvestmentTypes";
        const [rows] = await executeQuery(sql);
        return rows;
    },

    /**
     * Generates mock budgeting advice based on user data.
     * @param {string} personId
     */
    generateBudgetingAdvice: async (personId) => {
        // Mock logic: In a real app, this would use ML/business rules.
        const totalInvestmentsSql = "SELECT SUM(allocated_fund) AS total FROM Investments WHERE person_id = ?";
        const [investmentResult] = await executeQuery(totalInvestmentsSql, [personId]);
        const totalInvested = parseFloat(investmentResult[0]?.total) || 0;
        
        if (totalInvested < 1000) {
            return [
                "**Increase Allocation:** Based on your current balance, allocate 10-15% of surplus income to high-yield savings or MMFs.",
                "**Diversify Low-Risk:** Start with low-risk funds like Treasury Bills or low-cost index funds.",
                "**Review Subscription Spends:** Cutting $50/month from non-essential subscriptions could fund a monthly investment plan."
            ];
        } else if (totalInvested >= 1000) {
            return [
                "**Moderate Risk Exposure:** Consider allocating 30% of new funds into moderate-risk equity ETFs.",
                "**Rebalance:** You currently have a strong position. Review your asset allocation for sector concentration.",
                "**Tax Efficiency:** Explore tax-advantaged retirement accounts if available."
            ];
        }
        return []; // Default return if no conditions met
    },

    /**
     * Records the user's choice to allocate funds to an investment type.
     * @param {string} personId
     * @param {number} typeId
     * @param {number} allocatedFund
     */
    recordInvestmentChoice: async (personId, typeId, allocatedFund) => {
        const sql = `
            INSERT INTO Investments (person_id, type_id, allocated_fund, date_chosen)
            VALUES (?, ?, ?, CURDATE())
        `;
        const [result] = await executeQuery(sql, [personId, typeId, allocatedFund]);
        return result.insertId;
    }
};

export default InvestmentModel;
