const { HttpError, ctrlWrapper } = require("../helpers/index");

const {
  Contact,
  JoiSchema,
  updateContactSchema,
  favoriteSchema,
} = require("../models/contact");

const getAll = async (req, res) => {
  const { _id: owner } = req.user;
  console.log(req.params);
  const { favorite, page = 1, limit = 20 } = req.query;

  if (favorite) {
    const contacts = await Contact.find({
      owner,
      favorite: favorite,
    });
    res.json({ contacts });
  }
  const skip = (page - 1) * limit;

  const contacts = await Contact.find({ owner, favorite }, "", {
    skip,
    limit,
  }).populate("owner", "email");
  res.json(contacts);
};

const getById = async (req, res) => {
  const { _id: owner } = req.user;
  const { id } = req.params;

  const result = await Contact.findOne({ _id: id, owner: owner });
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
};

const addContact = async (req, res) => {
  const { _id: owner } = req.user;
  const { error } = JoiSchema.validate(req.body);

  if (error) {
    throw HttpError(400, "missing required name field");
  }
  const result = await Contact.create({ ...req.body, owner });
  res.status(201).json(result);
};

const updateContact = async (req, res) => {
  const { _id: owner } = req.user;

  const { error } = updateContactSchema.validate(req.body);
  if (error) {
    throw HttpError(400, "missing fields");
  }

  const { id } = req.params;
  const result = await Contact.findOneAndUpdate(
    { _id: id, owner: owner },
    { new: true }
  );
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
};

const updateStatusContact = async (req, res) => {
  const { error } = favoriteSchema.validate(req.body);
  if (error) {
    throw HttpError(400, "missing field favorite");
  }

  const { id } = req.params;
  const { _id: owner } = req.user;
  const result = await Contact.findOneAndUpdate(
    { _id: id, owner: owner },
    req.body,
    { new: true }
  );
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
};

const deleteContact = async (req, res) => {
  const { _id: owner } = req.user;
  const { id } = req.params;
  const result = await Contact.findOneAndRemove({ _id: id, owner: owner });
  if (!result) {
    throw HttpError(404, "not found");
  }
  res.status({
    message: "Contact deleted",
  });
};

module.exports = {
  getAll: ctrlWrapper(getAll),
  getById: ctrlWrapper(getById),
  addContact: ctrlWrapper(addContact),
  updateContact: ctrlWrapper(updateContact),
  updateStatusContact: ctrlWrapper(updateStatusContact),
  deleteContact: ctrlWrapper(deleteContact),
};

//   const { favorite, email, page = 1, limit = 10 } = req.query;
//   const filter = {};

//   if (favorite === "true") {
//     filter.favorite = true;
//   } else if (favorite === "false") {
//     filter.favorite = false;
//   }

//   if (email === "true") {
//     filter.email = true;
//   } else if (email === "false") {
//     filter.email = false;
//   }

//   const skip = (page - 1) * limit;
//   const count = await Contact.countDocuments(filter);
//   const pages = Math.ceil(count / limit);

//   Contact.find(filter)
//     .skip(skip)
//     .limit(parseInt(limit))
//     .then((contacts) => {
//       res.status(200).json({
//         data: contacts,
//         page: parseInt(page),
//         pages: pages,
//         total: count,
//       });
//     })
//     .catch((error) => {
//       console.error(error);
//       res.status(500).json({ message: "Server error" });
//     });
// };
