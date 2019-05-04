const express = require("express");
const passport = require('passport');
const router = express.Router();
const User = require("../models/user");
const ensureLogin = require('connect-ensure-login');
const querystring = require('querystring');

// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;


router.get("/login", (req, res, next) => {
  res.render("auth/login", { "message": req.flash("error") });
});


/* GET home page */
// router.get('/', ensureLogin.ensureLoggedIn('/auth/login'), (req, res, next) => {
//   res.render('members');
// });

router.post("/login", passport.authenticate("local", {
  successRedirect: "/auth/dashboard",
  failureRedirect: "/auth/login",
  failureFlash: true,
  passReqToCallback: true
}));

router.get("/dashboard", ensureLogin.ensureLoggedIn('/auth/login'), (req, res, next) => {
  req.session.user = req.user.username;
  res.redirect('/data/dashboard');
});

router.get("/archive", ensureLogin.ensureLoggedIn('/auth/login'), (req, res, next) => {
  res.redirect('/data/archive');
});

router.get("/today", ensureLogin.ensureLoggedIn('/auth/login'), (req, res, next) => {
  res.render("auth/today", { loggedUser: req.user.username });
});

router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

//-------------------- User signup route ---------------------------------------------------------------

router.post("/signup", (req, res, next) => {
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  if (email === "" || username === "" || password === "") {
    res.render("auth/signup", { message: "Indicate email, username and password" });
    return;
  }

  User.findOne({ username }, "username", (err, user) => {
    if (user !== null) {
      res.render("auth/signup", { message: "The username already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      email,
      username,
      password: hashPass
    });

    newUser.save()
    .then(() => {
      // Send mail to user here   
      const query = querystring.stringify({
        "email": email
      });
      res.redirect("/data/sendsignupmail?" + query);   //--------------Send mail to user after signup--------------
    })
    .catch(err => {
      res.render("auth/signup", { message: "Something went wrong" });
    })
  });
});

router.post("/sendchat", (req, res, next) => {
  res.render('success', { message: 'Your message successfully sent' });
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});



module.exports = router;
