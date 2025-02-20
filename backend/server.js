require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const nodemailer = require("nodemailer");
const notifier = require("node-notifier");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "https://your-frontend.vercel.app", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected")).catch(err => console.error(err));

const OrderSchema = new mongoose.Schema({
  customerName: String,
  riceType: String,
  quantity: Number,
  status: { type: String, default: "Pending" }
});

const Order = mongoose.model("Order", OrderSchema);

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post("/order", async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  io.emit("newOrder", order);

  // Send desktop notification
  notifier.notify({ title: "New Order", message: `${order.customerName} ordered ${order.quantity}kg of ${order.riceType}` });

  // Send email notification
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: "New Order Received",
    text: `New order from ${order.customerName}: ${order.quantity}kg of ${order.riceType}.`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error("Email Error:", error);
    else console.log("Email Sent:", info.response);
  });

  res.status(201).json(order);
});

app.get("/orders", async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

io.on("connection", (socket) => {
  console.log("User connected");
  socket.on("disconnect", () => console.log("User disconnected"));
});

server.listen(5000, () => console.log("Server running on port 5000"));
    