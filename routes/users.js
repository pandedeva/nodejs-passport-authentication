const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
// Load User model
const User = require("../models/User");
const { forwardAuthenticated } = require("../config/auth");

// Login Page
router.get("/login", forwardAuthenticated, (req, res) => {
  res.render("login", { title: "Halaman Login" });
});

// Register Page
router.get("/register", forwardAuthenticated, (req, res) => {
  res.render("register", { title: "Halaman Pendaftaran" });
});

// Register
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // jika kolom masih ada yg kosong
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Isi semua kolom" });
  }

  // jika password tidak sama
  if (password != password2) {
    errors.push({ msg: "Password tidak sama" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password minimal harus 6 karakter" });
  }

  // kalau error tampilkan errornya dan kembali ke halaman register
  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
      title: "Halaman Pendaftaran",
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Email sudah terdaftar" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
          title: "Halaman Pendaftaran",
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });

        // hash password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            // set password to hashed
            newUser.password = hash;
            // save user
            newUser
              .save()
              .then((user) => {
                req.flash("success_msg", "Pendaftaran selesai dan silahkan login");
                res.redirect("/users/login");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "Kamu berhasil logged out");
  res.redirect("/users/login");
});

module.exports = router;
