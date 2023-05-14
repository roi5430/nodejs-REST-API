const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const { nanoid } = require("nanoid");

const {
  User,
  registerSchema,
  loginSchema,
  updateSubscriptionSchema,
  emailSchema,
} = require("../models/user");

const { HttpError, ctrlWrapper, sendEmail } = require("../helpers/index");

const { SECRET_KEY, BASE_URL } = process.env;

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    throw HttpError(400, "Error from Joi. Check your email or password");
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  const createHashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = nanoid();

  const newUser = await User.create({
    ...req.body,
    password: createHashPassword,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target = "blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click here to verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    email: newUser.email,
    password: newUser.password,
    subscription: newUser.subscription,
  });
};

const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw HttpError(404, "User not found");
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: "",
  });

  res.json({
    message: "Email verify seccess",
  });
};

const resentVerifyEmail = async (req, res) => {
  const { email } = req.body;

  const { error } = emailSchema.validate(req.body);
  if (error) {
    throw HttpError(400, "missing fields");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(400, "missing required field email");
  }

  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const verifyEmail = {
    to: email,
    subject: "Verify emeil",
    html: `<a target= "blank" href ="${BASE_URL}/api/users/verify/${user.verificationToken}">Click here to verify email</a>`,
  };
  await sendEmail(verifyEmail);

  res.json({
    messege: "Verification email sent",
  });
};

const login = async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    throw HttpError(400, "Error from Joi. Check your email or password");
  }

  const { email, password, subscription } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email is wrong");
  }

  if (!user.verify) {
    throw HttpError(401, "User not found");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Password is wrong");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "22h" });

  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token,
    email: user.email,
    subscription: user.subscription,
  });
};

const current = async (req, res) => {
  const { subscription, email } = req.user;
  res.json({
    subscription,
    email,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.json({ message: "user logout" });
};

const updateUserSubscription = async (req, res) => {
  const { error } = updateSubscriptionSchema.validate(req.body);
  if (error) {
    throw HttpError(400, "missing field subscription");
  }

  const { _id } = req.user;
  const result = await User.findByIdAndUpdate(_id, req.body, {
    new: true,
  });
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tmpApload, originalname } = req.file;
  const filename = `${_id}_${originalname}`;

  const resultUpload = path.join(avatarsDir, filename);
  await fs.rename(tmpApload, resultUpload);
  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(_id, { avatarURL });

  if (!_id) {
    throw HttpErorr(401, "Not authorized");
  }

  const formatFile = async () => {
    const image = await Jimp.read(resultUpload);
    image.resize(250, 250);
    image.write(resultUpload);
  };
  formatFile();

  res.json({ avatarURL });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  current: ctrlWrapper(current),
  logout: ctrlWrapper(logout),
  subscription: ctrlWrapper(updateUserSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
  verifyEmail: ctrlWrapper(verifyEmail),
  resentVerifyEmail: ctrlWrapper(resentVerifyEmail),
};
