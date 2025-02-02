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

        static async viewSubscriptionPlan(req: Request, res: Response) {
            try {
                const { id } = req.user!;
                
                
                const company = await prisma.company.findUnique({
                    where: { id },
                    select: {
                        subscriptionPlan: true,
                        filesProcessed: true,
                        usersCount: true,
                        additionalCost: true,
                    }
                });
    
                if (!company) {
                    return res.status(404).json({ message: 'Company not found.' });
                }
    
                return res.status(200).json({ subscription: company });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Error retrieving subscription plan.' });
            }
        }


        // update subscription plan
        static async changeSubscriptionPlan(req: Request, res: Response) {
            try {
                
               const { id } = req.user!;
               const { newPlan } = req.body;

               const company = await prisma.company.findUnique({
                where: {id},
               });

               if(!company) {
                return res.status(404).json({ message: 'Company not found.' });
               }

               // subscription rules
               let newFilesProcessed = company.filesProcessed;
               let newUsersCount = company.usersCount;
               let newAdditionalCost = company.additionalCost;

               if(newPlan === 'FREE') {
                 if(company.subscriptionPlan === 'FREE') {
                    return res.status(400).json({ message: 'You are already on the Free plan.' });
                 }

                 newFilesProcessed = 0;
                newUsersCount = 1;  
                newAdditionalCost = 0;
               }

               if(newPlan === 'BASIC') {
                if(company.subscriptionPlan === 'BASIC') {
                    return res.status(400).json({ message: 'You are already on the Basic plan.' });
                }

                newFilesProcessed = Math.min(company.filesProcessed, 100);
                newUsersCount = Math.min(company.usersCount, 10);

               }

               if(newPlan === 'PREMIUM') {
                if(company.subscriptionPlan === 'PREMIUM') {
                    return res.status(400).json({ message: 'You are already on the Premium plan.' });
                }

                newFilesProcessed = Math.min(company.filesProcessed, 1000); 
                newUsersCount = company.usersCount; 
                newAdditionalCost = company.filesProcessed > 1000 ? (company.filesProcessed - 1000) * 0.5 : 0;
               }

               // update in database
               const updatedCompany = await prisma.company.update({
                where: { id },
                data: {
                    subscriptionPlan: newPlan,
                    filesProcessed: newFilesProcessed,
                    usersCount: newUsersCount,
                    additionalCost: newAdditionalCost,
                },
               });

               return res.status(200).json({ message: 'Subscription plan updated successfully.', company: updatedCompany });


 
            } catch (error) {
                return res.status(500).json({ message: 'An error occurred while changing the subscription plan.' });
            }
        }
    
    }





export default UserController