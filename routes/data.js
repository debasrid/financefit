const express = require('express');
const moment = require('moment');
const Multer = require('multer');
const multerS3 = require('multer-s3');
const router = express.Router();

const Items = require('../models/item');
const ReceiptData = require('../models/receiptdata');
const Products = require('../models/product');
const User = require('../models/user');
const nodemailer = require('nodemailer');

// Load the SDK for JavaScript
var aws = require('aws-sdk');

var credentials = new aws.SharedIniFileCredentials({ profile: 'private-account' });
aws.config.credentials = credentials;

const rekognition = new aws.Rekognition({
  region: 'us-east-2'
});
const s3 = new aws.S3({
  region: 'us-east-2',
  Bucket: 'debby-labfiles'
});

const storage = new multerS3({
  s3: s3,
  bucket: 'debby-labfiles',
  key: function (req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname)
  }
})

const multer = Multer({ storage: storage });
//----------------------------------------------------------file upload to s3 and text detection-------------------------//

router.post('/uploadreceiptphoto', multer.single('receipt'), (req, res, next) => {

  console.log(req.file);
  ReceiptData.create({                              // Add S3 file metadata to database in document receiptdatas
    receiptImageName: req.file.key,
    receiptImagePath: req.file.location,
    receiptOriginalName: req.file.originalname,
    receiptImageBucket: req.file.bucket
  })
    .then(receipt => {
      //res.send(receipt);
      var params = {
        Image: { /* required */
          S3Object: {
            Bucket: receipt.receiptImageBucket,
            Name: receipt.receiptImageName
          }
        }
      };
      rekognition.detectText(params, function (err, data) {                 // Call AWS Rekognition API to detect text in uploaded file
        if (err) console.log(err, err.stack); // an error occurred
        else {
          var itemArray = [String];
          itemArray = data.TextDetections.map(TextDetection => TextDetection.DetectedText);    // Create item array from detected text
          ReceiptData.update({ _id: receipt.id },
            {
              receiptText: itemArray
            })
            .then(updateReceipt => {
              var arrayLength = itemArray.length;
              console.log("Itemarray: ", itemArray);
              for (var i = 0; i < arrayLength; i++) {
                var productName = new String();
                productName = itemArray[i];
                console.log("Item to match: ", productName);
                Products.findOne({ name: productName })        // ------------------Find each item in products inventory  ---> Not working
                  .then(products => {
                    console.log("Product found: ", products);
                    if (products != null) {
                      var item = new Items();
                      item.buying_date = moment(new Date()).format();
                      item.product_name = products.name;
                      item.store_name = products.brand_name;
                      item.calorie = products.calorie;
                      item.price = products.price;
                      item.buyer_name = req.user.username;

                      Items.create(item)                       //-------------------- Add detected item in Items document in database ---- End not working
                        .then(data => {
                          console.log("Item added: ", data);
                        })
                        .catch(err => {
                          if (err) console.log(err);
                        })
                    }
                  })
                  .catch(err => {
                    if (err) console.log(err);
                  })
              }
              res.render('success', { message: 'Receipt Uploaded Successfully' });
            })
            .catch(err => {
              if (err) console.log(err);
            })
        }
      });
    })
    .catch(err => {
      console.log(err);
    })

})

//--------------------------------------- Send mail to signedup user --------------------

router.get('/sendsignupmail', (req, res) => {

  // Option 2: Send mail with nodemailer

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    tls: {
      rejectUnauthorized: false
    },
    auth: {
      user: 'liza.vandervort67@ethereal.email',
      pass: '8Rj7KZVJhj3fPD1A5q'
    }
  });

  // send mail with defined transport object
  const info = transporter.sendMail({
    from: '"Debasri Dasgupta" <debasri_dasgupta@rediffmail.com>', // sender address
    to: req.query.email, // list of receivers
    subject: "Sign Up Successful", // Subject line
    text: "You have successfully signed up for the app", // plain text body
    html: "<b>You have successfully signed up for the app</b>" // html body
  });

  // Handle promise's fulfilled/rejected states
  info.then(
    function (data) {
      console.log(data.MessageId);
      res.redirect("/");
    }).catch(
      function (err) {
        console.error(err, err.stack);
      });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
})

//-------------------------- Load user dashboard route----------------------------------------------

router.get('/dashboard', (req, res, next) => {

  Items.distinct("store_name").then(distinctStoreArr => {
    Items.aggregate([
      { $group: { _id: "$buying_date", price: { $sum: "$price" }, calories: { $sum: "$calorie" }, count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]).then(result => {
      console.log(result)
      console.log("Store address: ", distinctStoreArr)
      res.render('auth/dashboard', { itemstats: result, loggedUser: req.user.username, storeStats: distinctStoreArr })
    })
  })

});

//----------------------------- Load User Item archive page ---------------------------

router.get('/archive', (req, res, next) => {
  Items.find({ buyer_name: req.user.username }, '')
    .then(items => {
      console.log(items);
      const totalPrice = items.reduce((acc, item) => acc + item.price, 0);
      const totalCalorie = items.reduce((acc, item) => acc + item.calorie, 0);
      res.render('auth/archive', { allitems: items, totalprice: totalPrice, totalcalorie: totalCalorie })
    })
    .catch(err => {
      if (err) console.log(err);
    })
});

//----------------------------- Add and save new items -------------------------

router.post('/today', (req, res) => {

  var buying_date = [];
  var product_name = [];
  var store_name = [];
  var price = [];
  var calorie = [];

  if (!Array.isArray(req.body.buying_date)) {
    buying_date[0] = req.body.buying_date;
    product_name[0] = req.body.product_name;
    store_name[0] = req.body.store_name;
    price[0] = req.body.price;
    calorie[0] = req.body.calorie;
  } else {
    buying_date = req.body.buying_date;
    product_name = req.body.product_name;
    store_name = req.body.store_name;
    price = req.body.price;
    calorie = req.body.calorie;
  }

  console.log("Buying date array:", buying_date);
  console.log("product_name array:", product_name);
  console.log("store_name array:", store_name);
  console.log("price array:", price);
  console.log("calorie array:", calorie);

  for (i in buying_date) {
    var item = new Items();

    if (buying_date[i] != null) {
      item.buying_date = moment(buying_date[i]).format("YYYY-MM-DD");
    } else {
      res.render('today', { message: 'Buying Date cannot be null' })
    }

    item.buyer_name = req.user.username;
    item.product_name = product_name[i];
    item.store_name = store_name[i];
    item.price = price[i];
    item.calorie = calorie[i];

    Items.create(item)
      .then(data => {
        console.log("Item added: ", item);
      })
      .catch(err => {
        if (err) console.log(err);
      })
  }
  res.render('success', { message: 'Item added successfully' });

})

//-------------------- Load page for editing item -------------------------------------------------------

router.get('/edit', (req, res, next) => {
  Items.find({ _id: req.query.id })
    .then(items => {
      items.buying_date = moment(items.buying_date).format("YYYY-MM-DD");
      console.log(items);
      res.render('auth/itemedit', { allitems: items })
    })
    .catch(err => {
      if (err) console.log(err);
    })
});

//---------------------- Save edited item ---------------------------------------------------------------------
router.post('/itemedit', (req, res) => {

  Items.update({ _id: req.query.id }, req.body)
    .then(data => {
      res.render('success', { message: 'Item edited successfully' });
    })
    .catch(err => {
      if (err) console.log(err);
    })
})



module.exports = router;