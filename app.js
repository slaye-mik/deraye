const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = "deraye22mahmud";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

// Enhanced Admin Auth Middleware
app.use("/admin*", (req, res, next) => {
  if (req.query.password === ADMIN_PASSWORD) return next();
  
  res.send(`
    <div style="max-width: 400px; margin: 50px auto; padding: 20px; 
                border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="text-align: center; color: #333;">Admin Login</h2>
      <form action="/admin" method="GET" style="display: flex; flex-direction: column; gap: 15px;">
        <input type="password" name="password" placeholder="Enter password" 
               style="padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
        <button type="submit" 
                style="padding: 10px; background: #4CAF50; color: white; 
                       border: none; border-radius: 4px; cursor: pointer;">
          Login
        </button>
        ${req.query.password ? '<p style="color: red; text-align: center;">Invalid password!</p>' : ''}
      </form>
    </div>
  `);
});

// MongoDB Connection
mongoose.connect("mongodb+srv://mahmudkhaled08:tF3das7znwrSTdjg@cluster0.laqhw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error(err));

// Routes
const productRoutes = require("./routes/products");
app.use("/api", productRoutes);

// Admin Route
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// All other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});