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

            // get filesprocessed and plan
            const company = await prisma.company.findUnique({
                where: {id: Number(companyId)},
                select: { filesProcessed: true, subscriptionPlan: true}

            });

            if (!company) {
                return res.status(404).json({ message: "Company not found" });
            }
            

           let { filesProcessed, subscriptionPlan } = company;

           const planLimits: Record<string, number> = {
            free: 10,
            basic: 100,
            premium: 1000
        };

        if (subscriptionPlan === "PREMIUM" && filesProcessed >= 1000) {
            console.log(`Extra charge for premium: $${(filesProcessed - 1000) * 0.5}`);
        } else if (planLimits[subscriptionPlan] !== undefined && filesProcessed >= planLimits[subscriptionPlan]) {
            return res.status(403).json({ message: "File upload limit reached for your plan." });
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

            await prisma.company.update({
                where: { id: Number(companyId) },
                data: { filesProcessed: filesProcessed + 1 }
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

    static async fileDeletion(req: Request, res: Response) {
        try {
            const { fileId } = req.params;
            const { userId } = req.body;

            const file = await prisma.file.findUnique({
                where: {
                    id: Number(fileId)
                }
            });

            if(!file) {
                return res.status(404).json({ message: 'File not found.' });
            }

            if (file.userId !== Number(userId)) {
                return res.status(403).json({ message: 'You are not authorized to delete this file.' });
              }

              await prisma.file.delete({
                where: {
                  id: Number(fileId),
                },
              });


              res.status(200).json({ message: 'File deleted successfully.' });
            


        } catch (error) {
            console.error('Error deleting file:', error);
         res.status(500).json({ message: 'Failed to delete file.' });
        }
    }

    
}



export default UploadController