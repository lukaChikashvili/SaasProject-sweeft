import { Router } from "express";
import AuthController from "../controllers/AuthController.js"

const router = Router();

router.post('/auth/register', AuthController.register);
router.get("/auth/activate/:token", AuthController.activateAccount);

export default router;