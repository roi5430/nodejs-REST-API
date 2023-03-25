const express = require("express");
const router = express.Router();

const ctrl = require("../../controllers/contacts");

const isValidId = require("../../middlewares/isValidId");
const authenticate = require("../../middlewares/authorization");

router.get("/", authenticate, ctrl.getAll);

router.get("/:id", authenticate, isValidId, ctrl.getById);

router.post("/", authenticate, ctrl.addContact);

router.delete("/:id", authenticate, isValidId, ctrl.deleteContact);

router.patch(
  "/:id/favorite",
  authenticate,
  isValidId,
  ctrl.updateStatusContact
);

router.put("/:id", isValidId, authenticate, ctrl.updateContact);

module.exports = router;
