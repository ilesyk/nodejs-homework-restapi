import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ctrlWrapper } from "../helpers/index.js";
import { HttpError } from "../helpers/index.js";
import dotenv from "dotenv";

dotenv.config();
const { JWT_SECRET } = process.env;

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ ...req.body, password: hashPassword });
  res.status(201).json({
    user: { email: newUser.email, subscription: newUser.subscription },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password invalid");
  }
  const payload = {
    id: user._id,
  };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
    await User.findByIdAndUpdate(user._id, { token });
    user.token = token;
  res.json({
    token,
    user: { email: user.email, subscription: user.subscription },
  });
};

const updateUserSubscription = async (req, res) => {
  const { id } = req.params;
  const result = await User.findByIdAndUpdate(id, req.body, { new: true });
  if (!result) {
    res.status(404).json({ message: "Not Found" });
  }
  res.status(200).json(result);
};

const logout = async (req, res) => {
  const { _id } = req.user;
    const user = await User.findByIdAndUpdate(_id, { token: "" });
    if (!user) {
      throw HttpError(401, "Not authorized");
    }
  res.status(204).json({
    message: "No Content",
  });
};

const getCurrent = async (req, res) => {
  const { email } = req.user;
if (!email) {
      throw HttpError(401, "Not authorized");
    };
  res.json({
    email: user.email,
    subscription: user.subscription,
  });
};

export default {
  register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    updateSubscription: ctrlWrapper(updateUserSubscription),
  logout: ctrlWrapper(logout)
};
