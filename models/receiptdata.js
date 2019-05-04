const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const Items = require('../models/item.js');
const User = require('../models/user.js');



const ReceiptDataSchema = new Schema({
  date: Date,
  customerName: {type: Schema.Types.ObjectId, ref: 'user'},
  itemList :[{type: Schema.Types.ObjectId, ref: 'item'}],
  shopName: String,
  receiptImageName: String,
  receiptImagePath: String,
  receiptOriginalName: String,
  receiptText: [String],
  receiptImageBucket: String

});

const ReceiptData = mongoose.model('ReceiptData', ReceiptDataSchema);
module.exports = ReceiptData;