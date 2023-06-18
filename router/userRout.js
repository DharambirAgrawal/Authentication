import express from "express";
import {
  registerUser,
  authUser,
  forgetPassword,
  resetPassword,
} from "../controller/userControl.js";
import { protect } from "../middleware/Authentication.js";

const UserRouter = express.Router();

export const userRouter = UserRouter.post("/signup", registerUser)
  .post("/login", protect, authUser)
  .post("/forgetPassword", forgetPassword)
  .patch("/resetPassword/:token", resetPassword);

// UserRouter.route('/').get(fun).post(fun)
