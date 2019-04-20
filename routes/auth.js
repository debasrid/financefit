const express = require("express");
const passport = require('passport');
const router = express.Router();
const User = require("../models/user");
const ensureLogin = require('connect-ensure-login');

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
  res.render("auth/dashboard", { loggedUser: req.user.username });
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

router.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username === "" || password === "") {
    res.render("auth/signup", { message: "Indicate username and password" });
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
      username,
      password: hashPass
    });

    newUser.save()
    .then(() => {
      res.redirect("/");
    })
    .catch(err => {
      res.render("auth/signup", { message: "Something went wrong" });
    })
  });
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
