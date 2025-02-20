import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("https://your-backend.vercel.app");

function App() {
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({ customerName: "", riceType: "", quantity: "" });

  useEffect(() => {
    axios.get("https://your-backend.vercel.app/orders").then(res => setOrders(res.data));
    socket.on("newOrder", order => setOrders(prev => [...prev, order]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("https://your-backend.vercel.app/order", formData);
    setFormData({ customerName: "", riceType: "", quantity: "" });
  };

  return (
    <div>
      <h1>Rice Shop</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Name" value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} />
        <input type="text" placeholder="Rice Type" value={formData.riceType} onChange={(e) => setFormData({ ...formData, riceType: e.target.value })} />
        <input type="number" placeholder="Quantity (kg)" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
        <button type="submit">Order Now</button>
      </form>
      <h2>Orders</h2>
      <ul>{orders.map((order, i) => <li key={i}>{order.customerName} ordered {order.quantity}kg of {order.riceType}</li>)}</ul>
    </div>
  );
}

export default App;
