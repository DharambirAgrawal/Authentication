import express from "express";
import { server } from "../index.js";
import { userRouter } from "../router/userRout.js";

export const applyMiddleware = () => {
  server.use(express.json());
  server.use("/api/user", userRouter);
  server.all("*", (req, res) => {
    res.json({
      status: "errrrrrrr",
    });
  }); //default router
  //cookie parser
};
