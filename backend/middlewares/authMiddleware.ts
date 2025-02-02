import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return res.status(401).json({ message: "Access denied, no token provided." });
    }

    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        
        req.user = decoded;  
        next();
    } catch (error) {
        return res.status(400).json({ message: "Invalid token." });
    }
};
