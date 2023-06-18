import asyncHandler from "express-async-handler";
import { User } from "../models/userModel.js";
import { generateToken, encryption } from "../config/generateToken.js";
import { sendEmail } from "../utils/email.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword, pic } = req.body;
  if (!name || !email || !password || !confirmPassword) {
    res.status(400);
    throw new Error("Please Enter all the Fields");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    confirmPassword,
    pic,
  });
  if (user) {
    res.status(201),
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token: generateToken(user._id),
      });
  } else {
    throw new Error("Failed to create the User");
  }
});

export const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Fields");
  }
  const user = await User.findOne({ email });
  const isMatch = await user.matchPassword(password);
  if (!user || !isMatch) {
    res.status(400);
    throw new Error("Incorrrect password or Email");
  }
  res.status(200).json({
    status: "success",
    name: user.name,
    email: user.email,
    pic: user.pic,
    token: generateToken(user._id),
  });
});

export const forgetPassword = asyncHandler(async (req, res) => {
  //Getting user based on Posted email
  const { email } = req.body;
  const user = await User.findOne({ email });
  console.log(user);
  if (!user) {
    res.status(404);
    throw new Error("Couldnt found user");
  }
  //Generating A random Reset token
  const resetToken = user.CreateResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  //Send the token back to the user Email
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/user/resetPassword/${resetToken}`;
  const message = `We have received a password reset request.Please use the below link to reset your password\n\n${resetUrl}\n\nThis reset password link will be valid only for 10 minutes`;

  try {
    await sendEmail({
      email: user.email,
      subject: "password change request received",
      message: message,
    });

    res.status(200).json({
      status: "success",
      message: "password change request received",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error("Error sending message try again later ");
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  //checking if the user exists with given token and token has not expired
  const token = encryption(req.params.token);
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    res.status(400);
    throw new Error("Token is invalid");
  }
  //now we are allowing user to reset password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();

  //Login the user
  res.status(201),
    res.json({
      status: "success",
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
});
