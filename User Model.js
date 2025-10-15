// models/UserModel.js
import executeQuery from '../db/db.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const UserModel = {
    /**
     * Creates a new user in the database.
     */
    createUser: async (email, password) => {
        const personId = uuidv4();
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        const sql = "INSERT INTO Persons (person_id, email, password_hash) VALUES (?, ?, ?)";
        await executeQuery(sql, [personId, email, passwordHash]);
        
        return personId;
    },

    /**
     * Finds a user by email and returns their ID and hashed password.
     */
    findUserByEmail: async (email) => {
        const sql = "SELECT person_id, password_hash FROM Persons WHERE email = ?";
        const [rows] = await executeQuery(sql, [email]);
        return rows[0];
    },

    /**
     * Generates a JWT token for a given user ID.
     */
    generateAuthToken: (personId) => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not defined.");
        }
        return jwt.sign({ personId: personId }, secret, { expiresIn: '1d' });
    }
};

export default UserModel;
