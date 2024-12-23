const express = require("express");
const cors = require("cors");
require("dotenv").config();
const foodRouter = require("../routes/Food.routes");
const userRouter = require("../routes/User.routes");
const OrderRouter = require("../routes/Order.routes");
const dbConnect = require("./config/database.config");
dbConnect();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173"],
  })
);

app.use("/api/foods", foodRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", OrderRouter);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running at port:${PORT}`);
});
