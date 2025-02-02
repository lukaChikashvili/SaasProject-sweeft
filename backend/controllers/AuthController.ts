import { Request, Response, NextFunction } from "express";
import prisma from "../db/db.config.js";
import vine, { errors } from "@vinejs/vine";
import { loginSchema, registerSchema } from "../validations/authValidation.js";
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

  static async login(req: Request, res: Response) {
    try {
        const body = req.body;
        const validator = vine.compile(loginSchema);
        const payload = await validator.validate(body);

        const findUser = await prisma.company.findUnique({
            where: { email: payload.email }
        });

        if (!findUser) {
            return res.status(400).json({ errors: { email: "Invalid credentials" } });
        }

        if (!findUser.isActive) {
            return res.status(403).json({ message: "Please activate your account first." });
        }

        if (!bcrypt.compareSync(payload.password, findUser.password)) {
            return res.status(400).json({ errors: { email: "Invalid credentials" } });
        }

        const payloadData = {
            id: findUser.id,
            name: findUser.name,
            email: findUser.email,
            country: findUser.country,
            industry: findUser.industry
        };

        const token = jwt.sign(payloadData, process.env.JWT_SECRET as string, { expiresIn: "365d" });

        return res.json({ message: "Logged in", access_token: `Bearer ${token}` });



    } catch (error) {
        if (error instanceof errors.E_VALIDATION_ERROR) {
                return res.status(400).json({ errors: error.messages });
            }
            return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}


export default AuthController;
