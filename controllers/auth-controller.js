import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import gravatar from "gravatar";
import { ctrlWrapper } from "../helpers/index.js";
import dotenv from "dotenv";
import path from "path";
import fs from "fs/promises";
import Jimp from "jimp";
import sendEmail from "../helpers/sendEmail.js";
import { nanoid } from "nanoid";

dotenv.config();
const { JWT_SECRET, BASE_URL } = process.env;
const avatarsFolder = path.resolve("public", "avatars");

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    res.status(409).json({ message: "Email in use" });
    return;
  }
  const avatarURL = gravatar.url(email);
  const verificationToken = nanoid();
  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });
  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/users/verify/${verificationToken}">Click here to verify your email</a>`,
  };
  await sendEmail(verifyEmail);
  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
      avatarURL: newUser.avatarURL,
      verificationToken: newUser.verificationToken,
    },
  });
};
const verify = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
   res.status(404).json({ message: "User not found" });
   return;
  }
   if (user.verify) {
     res.status(400).json({ message: "User is already verified" });
     return;
   }
  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: "null",
  });

  res.json({
    message: "Verification successful",
  });
};

const resendVerify = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email not found");
  }
  if (user.verify) {
     res.status(400).json({ message: "Verification has already been passed" });
     return;
  }
  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/users/verify/${user.verificationToken}">Click here to verify your email</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({
    message: "Email send success",
  });
};
const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(401).json({ message: "Email or password invalid" });
    return;
  }
  if (!user.verify) {
    res.status(401).json({ message: "Email is not verified" });
    return;
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    res.status(401).json({ message: "Email or password invalid" });
    return;
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

const updateUserAvatar = async (req, res) => {
  const { _id } = req.user;
  if (!req.file) {
    res.status(400).json({ message: "Bad Request - File not provided" });
    return;
  }
  const image = await Jimp.read(req.file.path);
  await image.resize(250, 250).writeAsync(req.file.path);
  const uniqueFilename = `${_id}_${req.file.originalname}`;
  const avatarDestination = path.join(avatarsFolder, uniqueFilename);
  await fs.rename(req.file.path, avatarDestination);
  const avatarURL = path.join("avatars", uniqueFilename);;
 await User.findByIdAndUpdate(_id, { avatarURL });
 res.json({
   avatarURL,
 });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  const user = await User.findByIdAndUpdate(_id, { token: "" });
  if (!user) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }
  res.status(204).json({
    message: "No Content",
  });
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;
  if (!email) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }
  res.json({
    email,
    subscription,
  });
};

export default {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  updateSubscription: ctrlWrapper(updateUserSubscription),
  logout: ctrlWrapper(logout),
  current: ctrlWrapper(getCurrent),
  updateAvatar: ctrlWrapper(updateUserAvatar),
  verify: ctrlWrapper(verify),
  resendVerify: ctrlWrapper(resendVerify)
};
