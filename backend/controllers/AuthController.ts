import { Request, Response } from "express";
import prisma from "../db/db.config.js";
import vine, {errors} from "@vinejs/vine";
import { registerSchema } from "../validations/authValidation.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'




class AuthController {
  static async register(req: Request, res: Response) {
    try {
         
        const body = req.body;
        const validator = vine.compile(registerSchema);
        const payload = await validator.validate(body);
 
        const findCompany = await prisma.company.findUnique({
            where: {
                email: payload.email
            }
        });


        if(findCompany) {
            return res.status(400).json({ errors: { email: "Email already taken. Use another email." } });
        }

        // hashing the password
        const salt = bcrypt.genSaltSync(10);
        payload.password = bcrypt.hashSync(payload.password, salt);

        // create user in database
        const company = await prisma.company.create({
            data: { ...payload, isActive: false }
        });

        const activationToken = jwt.sign(
            { id: company.id, email: company.email },
             process.env.JWT_SECRET as string,
            { expiresIn: '1d' }
        );
         

        const activationLink = `${process.env.PORT}/api/auth/activate/${activationToken}`;

        return res.json({
            status: 200,
            message: "User registered successfully. Please check your email to activate your account.",
            activationLink
        });




    } catch (error) {
        if (error instanceof errors.E_VALIDATION_ERROR) {
            return res.status(400).json({ errors: error.messages });
        }

        return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}


export default AuthController