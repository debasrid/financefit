const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const productSchema = new Schema({
  name: String,
  buying_date: String,
  brand_name: String,
  unit: String,
  calorie: Number,
  price: Number  
});

const Products = mongoose.model('Product', productSchema);
module.exports = Products;
