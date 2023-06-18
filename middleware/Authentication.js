import asyncHandler from "express-async-handler";
import { verifyToken } from "../config/generateToken.js";
import { User } from "../models/userModel.js";

export const protect = asyncHandler(async (req, res, next) => {
  //Read the token and check if it exists password
  const testToken = req.headers.authorization;

  let token;
  if (testToken && testToken.startsWith("bearer")) {
    token = testToken.split(" ")[1];
  }
  if (!token) {
    res.status(401);
    throw new Error("Unauthorized");
  }

  //validate token
  const decodedToken = await verifyToken(token);
  console.log(decodedToken);

  // if the user exists
  const user = await User.findOne({ _id: decodedToken.id });

  if (!user) {
    res.status(401);
    throw new Error("User doesnt exists");
  }
  //if the user change password after the token was issued
  //like if the user have changed password and has older token so he cannot asses again our rout he has to relogin to get new token

  //sending the timestamp when jwt was issued
  if (user.ispasswordChanged(decodedToken.iat)) {
    res.status(401);
    throw new Error("Password has been changed Recently.Please Login again");
  }

  //allow user to access route
  req.user = user;
  next();
});
