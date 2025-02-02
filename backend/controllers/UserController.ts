import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../db/db.config.js";

import vine, { errors } from "@vinejs/vine";
import { updateUserSchema } from "../validations/authValidation.js";

class UserController {
    static async updateUserDetails(req: Request, res: Response) {
        try {
            const validator = vine.compile(updateUserSchema);
            const payload = await validator.validate(req.body);

            const { id } = req.user!;
            const { name, email, country, password, industry} = payload;

            // password validation
            if(password) {
                const salt = bcrypt.genSaltSync(10);
                const hashedPassword = bcrypt.hashSync(password, salt);

                const updatedUser = await prisma.company.update({
                    where: { id },
                    data: {
                        name,
                        email,
                        country,
                        password: hashedPassword,
                        industry
                    }
                });

                return res.status(200).json({ message: "User details updated successfully", user: updatedUser });


            }

            const updatedUser = await prisma.company.update({
                where: { id },
                data: {
                    name,
                    email,
                    country,
                    industry
                }
            });

            return res.status(200).json({ message: "User details updated successfully", user: updatedUser });



        } catch (error) {
            if (errors) {
                return res.status(400).json({ errors: errors });
            }

       
            console.error(error);
            return res.status(500).json({ message: "An error occurred while updating user details." });
        }
        }

        // subscription rules
        static async uploadFile(companyId: number, file: File) {
            const company = await prisma.company.findUnique({
                where: {
                    id: companyId
                }
            });

            if (!company) {
                throw new Error('Company not found');
              }


            switch(company.subscriptionPlan) {
                case 'FREE':
                    if(company.filesProcessed >= 10) {
                        throw new Error('File limit exceeded free plan');
                    }
                break;
                
                case 'BASIC':
                    if(company.filesProcessed >= 100) {
                        throw new Error('File limit exceeded basic plan');
                    }

                    break;

                case 'PREMIUM':
                    if(company.filesProcessed >= 1000) {
                        company.additionalCost += 0.5;
                    }
                    
                    break;

                    default:
                       throw new Error('Invalid subscription plan');
            }

            await prisma.company.update({
                where: { id: companyId },
                data: {
                  filesProcessed: company.filesProcessed + 1,
                  additionalCost: company.additionalCost,
                },

            })
            
        }
    }





export default UserController