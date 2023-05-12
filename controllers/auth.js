const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  User,
  registerSchema,
  loginSchema,
  updateSubscriptionSchema,
} = require("../models/user");
const { HttpError, ctrlWrapper } = require("../helpers/index");
const { SECRET_KEY } = process.env;

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

  const newUser = await User.create({
    ...req.body,
    password: createHashPassword,
  });

  res.status(201).json({
    email: newUser.email,
    password: newUser.password,
    subscription: newUser.subscription,
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

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  current: ctrlWrapper(current),
  logout: ctrlWrapper(logout),
  subscription: ctrlWrapper(updateUserSubscription),
};
