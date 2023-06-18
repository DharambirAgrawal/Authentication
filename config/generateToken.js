import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export const verifyToken = async (id) => {
  return jwt.verify(id, process.env.JWT_SECRET);
};

export const encryption = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
