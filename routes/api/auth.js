const express = require("express");

const ctrl = require("../../controllers/auth");
const authenticate = require("../../middlewares/authorization");

const router = express.Router();

router.post("/register", ctrl.register);

router.post("/login", ctrl.login);

router.get("/current", authenticate, ctrl.current);

router.post("/logout", authenticate, ctrl.logout);

router.patch("/subscription", authenticate, ctrl.subscription);

module.exports = router;
