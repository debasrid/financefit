const express = require('express');
const router  = express.Router();

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

/* GET chat page */
router.get('/chat', (req, res, next) => {
  res.render("chat");
});

module.exports = router;
