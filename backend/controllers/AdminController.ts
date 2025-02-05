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
}


export default AdminController