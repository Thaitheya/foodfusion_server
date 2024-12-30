const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const handler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { UserModel } = require("../src/models/user.model");
const { BAD_REQUEST, SUCCESS } = require("../src/constants/httpStatus");
const PASSWORD_HASH_SALT = 10;
const Auth = require("../src/middleware/Auth.mid");
const jwtSecret = process.env.JWT_SECRET;

router.post(
  "/register",
  handler(async (req, res) => {
    const { name, email, password, address } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
      res.status(BAD_REQUEST).json({ message: "User Already Exist" });
      return;
    }
    const hashPassword = await bcrypt.hash(password, PASSWORD_HASH_SALT);

    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashPassword,
      address,
    };
    console.log(newUser);
    const result = await UserModel.create(newUser);
    res.send(generateTokenResponse(result));
  })
);
router.post(
  "/login",
  handler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res
        .status(BAD_REQUEST)
        .json({ message: "Email and password are required." });
      return;
    }

    const user = await UserModel.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.send(generateTokenResponse(user));
      return;
    }
    res
      .status(BAD_REQUEST)
      .json({ message: "Username or Password is invalid" });
  })
);

router.put(
  "/updateProfile",
  Auth,
  handler(async (req, res) => {
    const { name, address } = req.body;

    if (!name || name.length < 3) {
      return res.status(BAD_REQUEST).json({ message: "Invalid name" });
    }
    if (!address || address.length < 10) {
      return res.status(BAD_REQUEST).json({ message: "Invalid address" });
    }

    try {
      const user = await UserModel.findByIdAndUpdate(
        req.user.id,
        { name, address },
        { new: true }
      );

      if (!user) {
        return res.status(BAD_REQUEST).json({ message: "User not found" });
      }

      res.json(generateTokenResponse(user));
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(BAD_REQUEST).json({ message: "Failed to update profile" });
    }
  })
);

router.put(
  "/changePassword",
  Auth,
  handler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await UserModel.findById(req.user.id);
    if (!user) {
      res.status(BAD_REQUEST).send({ message: "User not found." });
      return;
    }
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      res.status(BAD_REQUEST).send({ message: "Incorrect current password." });
      return;
    }
    user.password = await bcrypt.hash(newPassword, PASSWORD_HASH_SALT);
    await user.save();

    res.status(SUCCESS).send({ message: "Password changed successfully." });
  })
);

const generateTokenResponse = (user) => {
  if (!user) {
    throw new Error("User is required to generate a token.");
  }

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    jwtSecret,
    { expiresIn: "1h" }
  );

  return {
    id: user._id,
    email: user.email,
    name: user.name,
    address: user.address,
    isAdmin: user.isAdmin,
    token,
  };
};

module.exports = router;
