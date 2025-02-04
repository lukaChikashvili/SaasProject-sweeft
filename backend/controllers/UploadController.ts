import { Request, Response } from "express";
import multer from 'multer'
import path from 'path';


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
        cb(new Error("only CSV, XLS and XLSX files are allowed"));
    }
}

const upload = multer({storage, fileFilter});




class UploadController {
    
}