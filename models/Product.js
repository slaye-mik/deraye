const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Product name is required'] 
    },
    category: { 
      type: String,
      required: true,
      enum: ['drinks', 'cakes', 'chips', 'gums-candy', 'others'],
      lowercase: true
  },
    pcs: { 
        type: Number, 
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1'] 
    },
    image: { 
        type: String, 
        required: [true, 'Image URL is required'] 
    }
    
});

module.exports = mongoose.model('Product', productSchema);