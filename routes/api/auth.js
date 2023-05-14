const express = require("express");

const ctrl = require("../../controllers/auth");
const authenticate = require("../../middlewares/authorization");
const upload = require("../../middlewares/upload");

const router = express.Router();

router.post("/register", ctrl.register);

router.get("/verify/:verificationToken", ctrl.verifyEmail);

router.post("/verify", ctrl.resentVerifyEmail);

router.post("/login", ctrl.login);

router.get("/current", authenticate, ctrl.current);

router.post("/logout", authenticate, ctrl.logout);

router.patch("/subscription", authenticate, ctrl.subscription);

router.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  ctrl.updateAvatar
);

module.exports = router;
