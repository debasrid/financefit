const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const itemSchema = new Schema({
  buyer_name: String,
  buying_date: Date,
  product_name: String,
  store_name: String,
  price: Number,
  calorie: Number  
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const Items = mongoose.model('Item', itemSchema);
module.exports = Items;
