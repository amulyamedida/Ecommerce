const express = require("express");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const auth = require("../middleware/auth.middleware");
const router = express.Router();

router.post("/", auth, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
  if (!cart || cart.items.length === 0) return res.status(400).json({ message: "Cart is empty" });

  const order = new Order({
    user: req.user.id,
    items: cart.items.map((item) => ({ product: item.product._id, quantity: item.quantity })),
  });

  await order.save();
  cart.items = [];
  await cart.save();

  res.status(201).json(order);
});

module.exports = router;
