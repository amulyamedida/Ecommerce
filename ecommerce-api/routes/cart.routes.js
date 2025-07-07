const express = require("express");
const Cart = require("../models/Cart");
const auth = require("../middleware/auth.middleware");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
  res.json(cart);
});

router.post("/add", auth, async (req, res) => {
  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) cart = new Cart({ user: req.user.id, items: [] });

  const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  res.json(cart);
});

router.post("/remove", auth, async (req, res) => {
  const { productId } = req.body;
  const cart = await Cart.findOne({ user: req.user.id });
  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  await cart.save();
  res.json(cart);
});

module.exports = router;