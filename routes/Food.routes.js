const express = require("express");
const router = express.Router();
const { FoodModel } = require("../src/models/food.model");
const handler = require("express-async-handler");
const admin = require('../src/middleware/Admin.mid')
router.get(
  "/",
  handler(async (req, res) => {
    const foods = await FoodModel.find({});
    res.send(foods);
  })
);
router.post(
  "/",
  admin,
  handler(async (req, res) => {
    const { name, price, tags, favorite, imageUrl, origins, cookTime } =
      req.body;
    if (!name || !price || !origins || !cookTime) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    try {
      const newFood = await FoodModel.create({
        name,
        price,
        tags: tags.split ? tags.split(",") : tags,
        favorite: favorite || false, 
        imageUrl,
        origins: origins.split ? origins.split(",") : origins, 
        cookTime,
      });

      res.status(201).send({
        message: "Food added successfully",
        food: newFood,
      });
    } catch (error) {
      console.error("Error adding food:", error);
      res.status(500).send({ error: "An error occurred while adding food" });
    }
  })
);

router.put(
  "/",
  admin,
  handler(async (req, res) => {
    const { id, name, price, tags, favorite, imageUrl, origins, cookTime } =
      req.body;
    if (!id || !name || !price || !origins || !cookTime) {
      return res.status(400).send({ error: "Missing required fields" });
    }
    try {
      const result = await FoodModel.updateOne(
        { _id: id },
        {
          name,
          price,
          tags: tags.split ? tags.split("") : tags,
          favorite,
          imageUrl,
          origins: origins.split ? origins.split(",") : origins || [],
          cookTime,
        }
      );
      if (result.matchedCount === 0) {
        return res.status(404).send({ error: "Food item not found" });
      }

      res.send({ message: "Food updated successfully" });
    } catch (error) {
      console.error("Error updating food:", error);
      res.status(500).send({ error: "An error occurred while updating food" });
    }
  })
);

router.delete(
  "/:foodId",
  admin,
  handler(async (req, res) => {
    const { foodId } = req.params;
    const result = await FoodModel.deleteOne({ _id: foodId });

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "Food not found" });
    }

    res.send({ message: "Food deleted successfully" });
  })
);

router.get(
  "/tags",
  handler(async (req, res) => {
    const tags = await FoodModel.aggregate([
      {
        $unwind: "$tags",
      },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          count: "$count",
        },
      },
    ]).sort({ count: -1 });
    const all = {
      name: "All",
      count: await FoodModel.countDocuments(),
    };
    tags.unshift(all);
    res.send(tags);
  })
);
router.get(
  "/search/:searchTerm",
  handler(async (req, res) => {
    const { searchTerm } = req.params;
    const searchRegex = new RegExp(searchTerm, "i");
    const foods = await FoodModel.find({ name: { $regex: searchRegex } });
    res.send(foods);
  })
);

router.get(
  "/tag/:tag",
  handler(async (req, res) => {
    const { tag } = req.params;
    const foods = await FoodModel.find({tags: tag})
    res.send(foods);
  })
);

router.get(
  "/:foodId",
  handler(async (req, res) => {
    const { foodId } = req.params;
    const foods = await FoodModel.findById(foodId)
    res.send(foods);
  })
);
module.exports = router;
