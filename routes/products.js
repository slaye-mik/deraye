const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET all products
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});
router.put("/products/:id", async (req, res) => {
  try {
    const { name, category, pcs, image } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, category, pcs, image },
      { new: true }
    );
    res.json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});
router.delete("/products/:id", async (req, res) => {
  try {
    if (req.query.password !== "deraye22mahmud") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// POST new product
router.post("/products", async (req, res) => {
  try {
    const { name, category, pcs, image } = req.body;
    
    // Enhanced validation
    if (!name?.trim() || !category?.trim() || !pcs || !image?.trim()) {
      return res.status(400).json({ 
        error: "All fields are required",
        fields: { name, category, pcs, image }
      });
    }

    if (isNaN(pcs) || pcs < 1) {
      return res.status(400).json({ 
        error: "Quantity must be a valid number greater than 0" 
      });
    }

    const newProduct = await Product.create({ 
      name: name.trim(),
      category: category.trim(),
      pcs: Number(pcs),
      image: image.trim()
    });
    
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ 
      error: "Server Error",
      message: err.message
    });
  }
});

module.exports = router;