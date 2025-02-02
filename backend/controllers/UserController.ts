import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../db/db.config";
import { authenticate } from "../middleware/authenticate";

class UserController {
    static async updateUserDetails(req: Request, res: Response) {
        try {
            
            const { id } = req.user;
            const { name, email, country, password, industry} = req.body;

            // password validation
            


        } catch (error) {
            
        }
    }

}



export default UserController