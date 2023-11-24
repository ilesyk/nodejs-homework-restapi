import express from "express";
import authController from "../controllers/auth-controller.js";
import { authenticate, isEmptyBody, validateBody } from "../middlewares/index.js";
import { userValidateSchema } from "../models/User.js";

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
export default authRouter;
