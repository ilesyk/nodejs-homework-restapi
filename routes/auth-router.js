import express from "express";
import authController from "../controllers/auth-controller.js";
import { authenticate, isEmptyBody, validateBody, upload } from "../middlewares/index.js";
import { userEmailSchema, userValidateSchema } from "../models/User.js";

const authRouter = express.Router();

authRouter.post(
  "/register",
  isEmptyBody,
  validateBody(userValidateSchema),
  authController.register
);
authRouter.post(
  "/login",
  isEmptyBody,
  validateBody(userValidateSchema),
  authController.login
);
authRouter.post("/logout", authenticate, authController.logout);
authRouter.get('/current', authenticate, authController.current);
authRouter.get("/verify/:verificationToken", authController.verify);

authRouter.post(
  "/verify",
  isEmptyBody,
  validateBody(userEmailSchema),
  authController.resendVerify
);
// authRouter.patch('/subscription'.authenticate, authController.updateSubscription);
authRouter.patch("/avatars",upload.single("avatar"), authenticate, authController.updateAvatar);
export default authRouter;
