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
    }





export default UserController