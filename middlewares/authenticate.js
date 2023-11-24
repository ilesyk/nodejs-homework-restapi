import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { HttpError } from "../helpers/index.js";
import { ctrlWrapper } from "../helpers/index.js";
import dotenv from "dotenv";

dotenv.config();
const { JWT_SECRET } = process.env;

const authenticate = async (req, res, next) => {
    const { authorization } = req.headers;
  if (!authorization) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer") {
    res.status(401).json({ message: "Not authorized" });
    return;
  }
  try {
      const { id } = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(id);
      console.log(user);
    if (!user || !user.token || user.token !== token) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    throw HttpError(401, error.message);
  }
};

export default ctrlWrapper(authenticate);
