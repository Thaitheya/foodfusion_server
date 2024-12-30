const sample_foods = [
  {
    id: "1",
    name: "Pizza Pepperoni",
    cookTime: "10-20",
    price: 100,
    favorite: false,
    origins: ["Italy", "US"],
    stars: 4.5,
    imageUrl: "food-10.jpg",
    tags: ["Fast Food", "Pizza"],
    description:
      "A classic Italian-American favorite with pepperoni slices and melted cheese on a crisp crust.",
  },
  {
    id: "2",
    name: "Cheeseburger",
    cookTime: "5-15",
    price: 80,
    favorite: true,
    origins: ["US"],
    stars: 4.0,
    imageUrl: "food-2.jpg",
    tags: ["Fast Food", "Burger"],
    description:
      "A juicy grilled beef patty topped with melted cheese, lettuce, and tomato in a toasted bun.",
  },
  {
    id: "3",
    name: "Sushi",
    cookTime: "20-30",
    price: 150,
    favorite: false,
    origins: ["Japan"],
    stars: 4.7,
    imageUrl: "food-3.jpg",
    tags: ["Healthy", "Seafood"],
    description:
      "A variety of fresh fish and vegetables wrapped in seasoned rice and seaweed.",
  },
  {
    id: "4",
    name: "Tacos",
    cookTime: "10-15",
    price: 60,
    favorite: true,
    origins: ["Mexico"],
    stars: 4.2,
    imageUrl: "food-4.jpg",
    tags: ["Fast Food", "Mexican"],
    description:
      "Traditional Mexican dish with seasoned meat, fresh vegetables, and salsa in a soft or crispy shell.",
  },
  {
    id: "5",
    name: "Pasta Alfredo",
    cookTime: "15-25",
    price: 120,
    favorite: false,
    origins: ["Italy"],
    stars: 4.3,
    imageUrl: "food-5.jpg",
    tags: ["Italian", "Pasta"],
    description:
      "Creamy pasta dish made with rich Alfredo sauce and Parmesan cheese, served with herbs.",
  },
  {
    id: "6",
    name: "Caesar Salad",
    cookTime: "5-10",
    price: 700,
    favorite: true,
    origins: ["US"],
    stars: 4.0,
    imageUrl: "food-6.jpg",
    tags: ["Healthy", "Salad"],
    description:
      "A refreshing salad with romaine lettuce, croutons, Parmesan cheese, and Caesar dressing.",
  },
  {
    id: "7",
    name: "Ramen Noodles",
    cookTime: "10-20",
    price: 90,
    favorite: false,
    origins: ["Japan"],
    stars: 4.6,
    imageUrl: "food-7.jpg",
    tags: ["Soup", "Asian"],
    description:
      "Japanese noodle soup served with a rich broth, fresh vegetables, and tender meat toppings.",
  },
  {
    id: "8",
    name: "Fried Chicken",
    cookTime: "15-25",
    price: 110,
    favorite: true,
    origins: ["US", "Korea"],
    stars: 4.4,
    imageUrl: "food-8.jpg",
    tags: ["Fast Food", "Chicken"],
    description:
      "Crispy and juicy fried chicken, seasoned to perfection and served with a variety of sauces.",
  },
  {
    id: "9",
    name: "Vegetable Stir Fry",
    cookTime: "10-15",
    price: 80,
    favorite: false,
    origins: ["China"],
    stars: 4.1,
    imageUrl: "food-9.jpg",
    tags: ["Vegetarian", "Asian"],
    description:
      "A healthy mix of fresh vegetables stir-fried with savory Asian sauces.",
  },
  {
    id: "10",
    name: "Ice Cream Sundae",
    cookTime: "5-10",
    price: 500,
    favorite: true,
    origins: ["US"],
    stars: 4.8,
    imageUrl: "food-101.jpg",
    tags: ["Dessert", "Sweet"],
    description:
      "A delightful dessert with scoops of ice cream, chocolate syrup, whipped cream, and a cherry on top.",
  },
];

const sample_tags = [
  { name: "All", count: 10 },
  { name: "Fast Food", count: 4 },
  { name: "Pizza", count: 2 },
  { name: "Dessert", count: 1 },
  { name: "Sweet", count: 1 },
  { name: "Burger", count: 1 },
  { name: "Chicken", count: 1 },
  { name: "Vegetarian", count: 1 },
  { name: "Asian", count: 2 },
  { name: "Mexican", count: 2 },
  { name: "Healthy", count: 2 },
  { name: "Soup", count: 1 },
];

module.exports = { sample_foods, sample_tags };

const Sample_users = [
  {
    name: "John Doe",
    email: "john.doe@example.com",
    password: "password123",
    address: "123 Main St",
    isAdmin: false,
  },
  {
    name: "Jane Admin",
    email: "jane.admin@example.com",
    password: "admin123",
    address: "456 Admin St",
    isAdmin: true,
  },
];

module.exports = { Sample_users };
