const express = require("express");
const cors = require("cors");
const path = require('path')
require("dotenv").config();
const foodRouter = require("../routes/Food.routes");
const userRouter = require("../routes/User.routes");
const OrderRouter = require("../routes/Order.routes");
const uploadRouter = require("../routes/Upload.routes");
const dbConnect = require("./config/database.config");
dbConnect();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use("/api/foods", foodRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", OrderRouter);
app.use("/api/upload", uploadRouter);
app.use("/uploads", express.static(path.join(__dirname, "public")));

const publicFolder = path.join(__dirname, "public");
app.use(express.static(publicFolder));

app.get("*", (req, res) => {
  const indexFilePath = path.join(publicFolder, "index.html");
  res.sendFile(indexFilePath);
});
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running at port:${PORT}`);
});
