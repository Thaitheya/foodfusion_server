const express = require("express");
const multer = require("multer");
const admin = require('../src/middleware/Admin.mid')
const handler = require("express-async-handler");
const { configCloudinary } = require("../src/config/cloudinary.config");
const {BAD_REQUEST} = require('../src/constants/httpStatus')
const router = express.Router();
const upload = multer();
router.post(
  "/",
  admin,
  upload.single("image"),
  handler(async (req, res) => {
    const file = req.file;
    if (!file) {
      res.status(BAD_REQUEST).send();
      return;
    }

    const imageUrl = await uploadImageToCloudinary(req.file?.buffer);
    res.send({ imageUrl });
  })
);

const uploadImageToCloudinary = (imageBuffer) => {
  const cloudinary = configCloudinary();

  return new Promise((resolve, reject) => {
    if (!imageBuffer) reject(null);

    cloudinary.v2.uploader.upload_stream((error, result) => {
        if (error || !result) reject(error);
        else resolve(result.url);
      })
      .end(imageBuffer);
  });
};


module.exports =  router;
