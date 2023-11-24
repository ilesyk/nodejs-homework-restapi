import {Contact} from "../models/Contact.js";
import {ctrlWrapper} from "../helpers/index.js";

const listContacts = async (req, res) => {
   const { _id: owner } = req.user;
   const { page = 1, limit = 10, ...filterParams } = req.query;
   const skip = (page - 1) * limit;
   const filter = { owner, ...filterParams };
  const result = await Contact.find(filter, "-createdAt -updatedAt", {skip, limit}).populate("owner", "email");
  res.status(200).json(result);
};

const getContactById = async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;
  const result = await Contact.findOne({ _id: id, owner });
  if (!result) {
    res.status(404).json({ message: "Not Found" });
  }
  res.status(200).json(result);
};

const addContact = async (req, res) => {
  const { _id: owner } = req.user;
  console.log(owner);
  const result = await Contact.create({...req.body, owner});
  res.status(201).json(result);
};

const updateContact = async (req, res) => {
  // if (Object.keys(req.body).length === 0) {
  //   res.status(400).json({ message: "missing fields" });
  //   return;
  // }
    const { id } = req.params;
  const { _id: owner } = req.user;
  const result = await Contact.findByIdAndUpdate({ _id: id, owner }, req.body, {
    new: true,
  });
  if (!result) {
    res.status(404).json({ message: "Not Found" });
  }
  res.status(200).json(result);
};

const updateStatusContact = async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;
  const result = await Contact.findOneAndUpdate(
    { _id: id, owner }, req.body,
    { new: true }
  );
  if (!result) {
    res.status(404).json({ message: "Not Found" });
  }
  res.status(200).json(result);
};

const removeContact = async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;
  const result = await Contact.findOneAndDelete({ _id: id, owner });
  if (!result) {
    res.status(404).json({ message: "Not Found" });
  }
  res.status(200).json({ message: "contact deleted" });
};


const ctrl = {
  listContacts: ctrlWrapper(listContacts),
  getContactById: ctrlWrapper(getContactById),
  removeContact: ctrlWrapper(removeContact),
  addContact: ctrlWrapper(addContact),
  updateContact: ctrlWrapper(updateContact),
  updateStatusContact: ctrlWrapper(updateStatusContact),
};

export default ctrl;