const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

/* ================= CONNECT MONGODB ================= */
mongoose.connect("mongodb://127.0.0.1:27017/dermalyx")
.then(()=>console.log("MongoDB Connected ✅"))
.catch(err=>console.log(err));

/* ================= MODELS ================= */

// USER
const User = mongoose.model("User", {
  email: String,
  password: String
});

// PRODUCT
const Product = mongoose.model("Product", {
  name: String,
  price: Number,
  category: String,
  image: String,
  description: String,
  benefits: String,
  usage: String
});

// CART
const Cart = mongoose.model("Cart", {
  user_id: String,
  product_id: String,
  quantity: Number
});


/* ================= AUTH ================= */

// REGISTER
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const user = new User({ email, password });
  await user.save();

  res.json({ message: "User Registered ✅" });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, password });

  if(user){
    res.json({ user });
  } else {
    res.status(401).json({ message: "Invalid credentials ❌" });
  }
});


/* ================= PRODUCTS ================= */

// GET ALL PRODUCTS
app.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// GET SINGLE PRODUCT
app.get("/product/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.json(product);
});

// ADD PRODUCT
app.post("/add-product", async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.json({ message: "Product Added ✅" });
});


/* ================= CART ================= */

// ADD TO CART
app.post("/cart", async (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  let item = await Cart.findOne({ user_id, product_id });

  if(item){
    item.quantity += quantity;
    await item.save();
  } else {
    item = new Cart({ user_id, product_id, quantity });
    await item.save();
  }

  res.json({ message: "Added to cart ✅" });
});

// GET CART
app.get("/cart/:user_id", async (req, res) => {

  const cartItems = await Cart.find({ user_id: req.params.user_id });

  let result = [];

  for(let item of cartItems){
    const product = await Product.findById(item.product_id);

    if(product){
      result.push({
        product_id: item.product_id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });
    }
  }

  res.json(result);
});

// UPDATE QTY
app.put("/cart", async (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  await Cart.findOneAndUpdate(
    { user_id, product_id },
    { quantity }
  );

  res.json({ message: "Updated ✅" });
});

// DELETE ITEM
app.delete("/cart", async (req, res) => {
  const { user_id, product_id } = req.body;

  await Cart.findOneAndDelete({ user_id, product_id });

  res.json({ message: "Deleted ✅" });
});

// CHECKOUT 
app.post("/checkout", async (req, res) => {
  const { user_id } = req.body;

  await Cart.deleteMany({ user_id });

  res.json({
    success: true,
    message: "Order placed successfully 🎉"
  });
});

/* ================= START SERVER ================= */
app.listen(3000, () => console.log("Server running on 3000 🚀"));