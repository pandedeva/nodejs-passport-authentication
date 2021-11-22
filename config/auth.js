module.exports = {
  // agar user tidak bisa masuk ke halaman dashboard sebelum login
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "Please log in to view that resource");
    res.redirect("/users/login");
  },
  // kalau user sudah login
  forwardAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect("/dashboard");
  },
};
