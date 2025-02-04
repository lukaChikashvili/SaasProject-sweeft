import { Request, Response } from "express";
import multer from 'multer'
import path from 'path';
import prisma from "../db/db.config.js";


// multer configuration
const storage = multer.diskStorage({
     destination: function(req, file, cb) {
        cb(null, "uploads/");
     },

     filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));

     }
});


// filter files
const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
    const allowedExtensions = [".csv", ".xls", ".xlsx"];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if(allowedExtensions.includes(ext)) {
        cb(null, true);
    }else {
        cb(null, false);
    }
}

const upload = multer({storage, fileFilter});




class UploadController {
    static async uploadFile(req: Request, res: Response) {
        try {

            const { visibility, allowedUsers, userId, companyId } = req.body;

            if(!req.file) {
                return res.status(400).json({message: "File is required"});
            }

            if (!userId || !companyId) {
                return res.status(400).json({ message: "User ID and Company ID are required" });
            }

            const allowedUsersArray = allowedUsers ? allowedUsers.split(",") : [];

            const newFile = await prisma.file.create({
                data: {
                    fileName: req.file.filename,
                    filePath: req.file.path,
                    visibility,
                    allowedUsers: allowedUsersArray,
                    userId: parseInt(userId),
                    companyId: parseInt(companyId),
                }
            });

            return res.status(201).json({ message: "File uploaded successfully", file: newFile });
            
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}



export default UploadController