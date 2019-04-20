const express = require('express');
const moment = require('moment');
const Multer = require('multer');
const multerS3 = require('multer-s3');
const router  = express.Router();

const Items = require('../models/item');
const ReceiptData = require('../models/receiptdata');
const User = require('../models/user');

const aws = require('aws-sdk');
const rekognition = new aws.Rekognition({
  accessKeyId: 'AKIAYFZIWAYCL7PDR4WQ',
  secretAccessKey: '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',
  region: 'us-east-2'
});
const s3 = new aws.S3({
  accessKeyId: 'AKIAYFZIWAYCL7PDR4WQ',
  secretAccessKey: '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',
  region: 'us-east-2',
  Bucket: 'debby-labfiles'
});

const storage = new multerS3({
  s3: s3,
  bucket: 'debby-labfiles',
  key: function(req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname)
  }
})

const multer = Multer({storage: storage});

router.get('/archive', (req, res, next) => {
  Items.find({ buyer_name: req.user.username })
    .then(items => {
      console.log(items);
      const totalPrice = items.reduce((acc, item) => acc + item.price, 0);
      const totalCalorie = items.reduce((acc, item) => acc + item.calorie, 0);
      res.render('auth/archive', {allitems: items, totalprice: totalPrice, totalcalorie: totalCalorie})
    })
    .catch(err => {
      if (err) console.log(err);
    })
});

router.get('/today', (req, res) => {
  ReceiptData.find()
    .then(ReceiptData => {
      res.render('archive', {ReceiptData: ReceiptData});
    })
    .catch(err => {
      console.log(err);
    })
})

router.post('/today', (req, res) => {

  var item = req.body;

  item.buying_date = moment(item.buying_date).format();

  Items.create(item)
    .then(data => {
      res.render('success',{message: 'Item added successfully'});
    })
    .catch(err => {
      if (err) console.log(err);
    })
})

router.get('/edit', (req, res, next) => {
  Items.find({ _id: req.query.id })
    .then(items => {
      console.log(items);
      res.render('auth/itemedit', {allitems: items})
    })
    .catch(err => {
      if (err) console.log(err);
    })
});


router.post('/itemedit', (req, res) => {

  Items.update({_id: req.query.id}, req.body)
    .then(data => {
      res.render('success',{message: 'Item edited successfully'});
    })
    .catch(err => {
      if (err) console.log(err);
    })
})

router.post('/uploadreceipt', multer.single('receipt'), (req, res, next) => {

  console.log(req.file);
  ReceiptData.create({
    receiptImageName: req.file.key,
    receiptImagePath: req.file.location,
    receiptOriginalName: req.file.originalname
  })
  .then(receipt => {
    //res.send(receipt);
    var params = {
      Image: { /* required */
        S3Object: {
          Bucket: 'debby-labfiles',
          Name: receipt.receiptImageName
        }
      }
    };
    rekognition.detectText(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else {
        ReceiptData.update({_id: receipt.id}, 
          {
            receiptText: data.TextDetections.map(TextDetection => TextDetection.DetectedText)
          })
        .then(updateReceipt => {
          res.render('success',{message: 'Receipt Uploaded Successfully'});
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

module.exports = router;