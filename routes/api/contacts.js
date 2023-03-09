const express = require("express");
const router = express.Router();

const ctrl = require("../../controllers/contacts");

const isValidId = require("../../middlewares/isValidId");

router.get("/", ctrl.getAll);

router.get("/:id", isValidId, ctrl.getById);

router.post("/", ctrl.addContact);

router.delete("/:id", isValidId, ctrl.deleteContact);

router.patch("/:id/favorite", isValidId, ctrl.updateStatusContact);

router.put("/:id", isValidId, ctrl.updateContact);

module.exports = router;
