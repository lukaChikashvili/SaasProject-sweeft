import { Request, Response } from "express";
import prisma from "../db/db.config.js";

class AdminController {
    static async getAllUsers(req:Request, res:Response) {
       try {
         
         const { id:companyId } = req.user!;
         
         

        const users = await prisma.user.findMany({
            where: {
                companyId: companyId, 
            },
        });

        return res.status(200).json({ users });

       } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while fetching users." });
       }
    }

    // get all files
    static async getAllFiles(req: Request, res: Response) {
        try {
            

            const files = await prisma.file.findMany();

            return res.status(200).json(files);
            
        } catch (error) {
            console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
        }
    }


    static async calculateBilling(req: Request, res: Response) {
        try {
            const { id } = req.user!;
    
            const company = await prisma.company.findUnique({
                where: { id },
                select: {
                    subscriptionPlan: true,
                    usersCount: true,
                    filesProcessed: true,
                }
            });
    
            if (!company) {
                return res.status(404).json({ message: "Company not found." });
            }
    
            let totalCost = 0;
    
            if (company.subscriptionPlan === "FREE") {
                totalCost = 0;
            } else if (company.subscriptionPlan === "BASIC") {
                totalCost = (company.usersCount - 1) * 5; 
            } else if (company.subscriptionPlan === "PREMIUM") {
                totalCost = 300; 
                if (company.filesProcessed > 1000) {
                    totalCost += (company.filesProcessed - 1000) * 0.5; 
                }
            }
    
            return res.status(200).json({ 
                subscriptionPlan: company.subscriptionPlan,
                usersCount: company.usersCount,
                filesProcessed: company.filesProcessed,
                totalCost: `$${totalCost.toFixed(2)}` 
            });
    
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An error occurred while calculating billing." });
        }
    }
    
}


export default AdminController