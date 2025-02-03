import { Router } from "express";
import AuthController from "../controllers/AuthController.js"
import { authenticate } from "../middlewares/authMiddleware.js";
import UserController from "../controllers/UserController.js";
import AdminController from "../controllers/AdminController.js";

const router = Router();

router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get("/auth/activate/:token", AuthController.activateAccount);

// update company details
router.put("/auth/update", authenticate, UserController.updateUserDetails);
// see company current subscription
router.get("/subscription", authenticate, UserController.viewSubscriptionPlan);
// update subscription plan
router.put('/subscription/update', authenticate, UserController.changeSubscriptionPlan );
// add users
router.post('/users', authenticate,  UserController.addEmployee);
// delete users
router.delete('/users/delete/:id', authenticate, UserController.deleteUser);


// get all users
router.get('/allusers', authenticate, AdminController.getAllUsers);

// user activation
router.get('/user/activate/:id', UserController.userActivation);

export default router;