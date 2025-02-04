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
    // file upload logic
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


    // update file visibility
    static async changeVisibility(req: Request, res: Response) {
        try {
            const {  fileId } = req.params;
            const { visibility } = req.body;

            const fileIdNumber = parseInt(fileId, 10);

            if (isNaN(fileIdNumber)) {
                return res.status(400).json({ message: 'Invalid file ID.' });
              }


              if (!visibility) {
                return res.status(400).json({ message: 'Visibility is required.' });
              }



            const updated = await prisma.file.update({
                where: {
                    id: fileIdNumber,
                    
                },
             data: {
                visibility: visibility
             }
            });

            if (updated) {
                res.status(200).json({
                    message: 'File visibility updated successfully.',
                    file: updated,
                });
            } else {
                res.status(404).json({
                    message: 'File not found.',
                });
            }
            
        } catch (error) {
            console.error('Error updating file visibility:', error);
            res.status(500).json({
                message: 'Failed to update file visibility.',
                
            });
        }
    }
}



export default UploadController