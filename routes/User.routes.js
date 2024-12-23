const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const handler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { UserModel } = require("../src/models/user.model");
const { BAD_REQUEST, SUCCESS } = require("../src/constants/httpStatus");
const PASSWORD_HASH_SALT = 10;
const jwtSecret = process.env.JWT_SECRET;

router.post (
  '/register',
  handler(async(req, res)=> {
    const {name, email, password, address} = req.body;
    const user = await UserModel.findOne({email});;
    if(user) {
      res.status(BAD_REQUEST).json({message: "User Already Exist"});
      return;
    }
    const hashPassword = await bcrypt.hash(
      password,
      PASSWORD_HASH_SALT
    )

    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashPassword,
      address,
    }
    console.log(newUser)
    const result = await UserModel.create(newUser);
    res.send(generateTokenResponse(result));

  })
)
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

    // Validate user credentials
    if (user && (await bcrypt.compare(password, user.password))) {
      res.send(generateTokenResponse(user));
      return;
    }

    // Invalid credentials
    res
      .status(BAD_REQUEST)
      .json({ message: "Username or Password is invalid" });
  })
);

const generateTokenResponse = (user) => {
  if (!user) {
    throw new Error("User is required to generate a token.");
  }

  const token = jwt.sign(
    {
      id: user._id, // Use MongoDB _id
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
