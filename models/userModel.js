import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import next from "next";
import crypto from "crypto";
import { encryption } from "../config/generateToken.js";

var validateEmail = function (email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: [true, "Please enter the name"] },
    email: {
      type: String,
      required: [true, "Please enter email"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validateEmail, "Please enter the valid Email"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: { type: String, required: [true, "Please enter the password"] },

    confirmPassword: {
      type: String,
      required: [true, "Please enter the password"],
      validate: {
        validator: function (val) {
          return val == this.password;
        },
        message: "password and confirm password do not match",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    pic: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
  },
  { timestamps: true }
);

//middleware
userSchema.methods.matchPassword = async function (enteredPassword) {
  const isAuth = await bcrypt.compare(enteredPassword, this.password);
  return isAuth;
};

userSchema.methods.ispasswordChanged = async function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    //checking if the password is changed or not
    const passwordChangedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000
    );
    return JWTTimeStamp < passwordChangedTimeStamp;
    console.log(passwordChangedTimeStamp, JWTTimeStamp);
  }
  return false;
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.CreateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = encryption(resetToken);
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000; //time in milisecond
  console.log(resetToken, this.passwordResetToken);
  return resetToken;
};

export const User = mongoose.model("User", userSchema);
