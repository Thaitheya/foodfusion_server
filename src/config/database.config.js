const { connect, set } = require("mongoose");
const { UserModel } = require("../models/user.model");
const { FoodModel } = require("../models/food.model");
const { Sample_users, sample_foods } = require("../data");
const bcrypt = require("bcryptjs");

set("strictQuery", true);

const dbConnect = async () => {
  try {
    await connect(process.env.URI);
    console.log("Connected successfully");

    console.log("Sample_users:", Sample_users); // Debug Sample_users
    console.log("sample_foods:", sample_foods); // Debug sample_foods

    await seedUsers();
    await seedFoods();
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};

module.exports = dbConnect;

async function seedUsers() {
  if (!Array.isArray(Sample_users)) {
    console.error("Sample_users is not iterable:", Sample_users);
    return;
  }

  const usersCount = await UserModel.countDocuments();
  if (usersCount > 0) {
    console.log("Users seed is already done!");
    return;
  }

  for (let user of Sample_users) {
    user.password = await bcrypt.hash(user.password, 10);
    await UserModel.create(user);
  }
  console.log("User seed is complete!");
}

async function seedFoods() {
  if (!Array.isArray(sample_foods)) {
    console.error("sample_foods is not iterable:", sample_foods);
    return;
  }

  const foodCount = await FoodModel.countDocuments();
  if (foodCount > 0) {
    console.log("Food seed is already done!");
    return;
  }

  for (let food of sample_foods) {
    food.imageUrl = `/foods/${food.imageUrl}`;
    await FoodModel.create(food);
  }
  console.log("Food seed is done!");
}
