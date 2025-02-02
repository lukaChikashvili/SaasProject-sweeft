import { Router } from "express";
import AuthController from "../controllers/AuthController.js"
import { authenticate } from "../middlewares/authMiddleware.js";
import UserController from "../controllers/UserController.js";

const router = Router();

router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get("/auth/activate/:token", AuthController.activateAccount);

// update company details
router.put("/auth/update", authenticate, UserController.updateUserDetails);

export default router;