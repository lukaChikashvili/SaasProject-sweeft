import { Request, Response, NextFunction } from "express";
import prisma from "../db/db.config.js";
import vine from "@vinejs/vine";
import { registerSchema } from "../validations/authValidation.js";
import bcrypt from 'bcryptjs'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { sendEmail } from "../mail/mail.js";




class AuthController {
    static async register(req: Request, res: Response, next: NextFunction): Promise<Response | void>{
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
         
        // create activation link
        const activationLink = `http://localhost:5000/api/auth/activate/${activationToken}`;


        // send email
        await sendEmail({
            toMail: company.email,
            subject: "Activate Your Account",
            body: `<h1>Click <a href="${activationLink}">here</a> to activate your account.</h1>`
        });


        return res.json({
            status: 200,
            message: "User registered successfully. Please check your email to activate your account.",
            activationLink
        });






    } catch (error: any) {
        if (error.messages) {
   
          return res.status(400).json({ errors: error.messages });
        }
  
        next(error);
    }
}


  static async activateAccount(req: Request, res: Response) {
       try {
        
          const { token } = req.params;
          const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

          const company = await prisma.company.update({
            where: {id: decoded.id},
            data: { isActive: true }
          });

          return res.json({ message: "Account activated successfully. You can now log in." });


       } catch (error) {
        return res.status(400).json({ message: "Invalid or expired activation link." });
       }
  }
}


export default AuthController;
