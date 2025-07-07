const Order = require("../models/order.model");
const Cart = require("../models/cart.model");

exports.createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const order = new Order({
      user: req.user.userId,
      items: cart.items,
      total,
    });

    await order.save();

    cart.items = [];
    await cart.save();

    // ✅ Return a clean response
    res.status(201).json({
      message: "Order placed successfully",
      order: {
        _id: order._id,
        userId: order.user.toString(),
        items: order.items.map(item => ({
          productId: item.product._id.toString(),
          quantity: item.quantity
        })),
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating order" });
  }
};
