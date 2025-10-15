// routes/AuthRoutes.js
import express from 'express';
import bcrypt from 'bcrypt';
import UserModel from '../models/UserModel.js';
import FundsModel from '../models/FundsModel.js'; // To create a default fund on registration

const router = express.Router();

/**
 * POST /api/auth/register
 * Registers a new user and creates a default cash fund for them.
 */
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        // 1. Check if user already exists
        const existingUser = await UserModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: "User already exists with this email." });
        }

        // 2. Create the user
        const personId = await UserModel.createUser(email, password);
        
        // 3. Create a default Cash fund for the new user
        await FundsModel.createFund(personId, 'Default Cash Wallet', 'Cash', 0.00);

        // 4. Generate and return token
        const token = UserModel.generateAuthToken(personId);
        res.status(201).json({ message: "Registration successful. Default fund created.", token, userId: personId });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: "Registration failed." });
    }
});

/**
 * POST /api/auth/login
 * Logs in a user.
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const user = await UserModel.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const token = UserModel.generateAuthToken(user.person_id);
        res.status(200).json({ message: "Login successful.", token, userId: user.person_id });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Login failed." });
    }
});

export default router;
