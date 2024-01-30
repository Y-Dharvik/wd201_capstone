const express = require("express");
const app = express();
const csurf = require("csurf");
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const localStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const path = require("path");
const { User } = require("./models");
const bodyParser = require("body-parser");


app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("Shh! It's a secret!"));
app.use(csurf({ cookie: true }));

app.set("views", path.join(__dirname, "views"));
app.use(flash());
const port = 3000
const saltRounds = 10;

app.use(session({
  secret : "my-super-secret-key-61835679215613",
  cookie : {maxAge : 24 * 60 * 60 * 1000},
}))

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy({
  usernameField : "email",
  passwordField : "password",
}, (username, password, done) => {
  User.findOne({ where: { email: username } })
  .then(async function (user) {
    if (!user) {
      return done(null, false, { message: "Invalid email" });
    }
    const result = await bcrypt.compare(password, user.password);
    if (result) {
      return done(null, user);
    } else {
      return done(null, false, { message: "Invalid password" });
    }
  })
  .catch((err) => {
    console.log(err);
    flash("error", "Couldn't Login, Please try again!");
    return done(err);
  });
}))

passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
})

passport.deserializeUser((id, done) => {
  console.log("Deserializing user from session", id);
  User.findByPk(id)
  .then((user) => {
    done(null, user);
  })
  .catch((err) => {
    done(err);
  })
})


app.use(function(request, response, next) {
  response.locals.messages = request.flash();
  next();
});

app.set("view engine", "ejs");
app.get("/", async (request, response) => {
    if(request.isAuthenticated()){
      return response.redirect("/dashboard");
    }
    response.render("default-page", );
});

app.get("/signup", function (request, response) {
  response.render("signup", { csrfToken: request.csrfToken() });
})

app.post('/users', async(req, res) => {
  if (req.body.email.length == 0) {
    req.flash("error", "Your email is blank! Provide your email");
    return res.redirect("/signup");
  }

  if (req.body.firstName.length == 0) {
    req.flash("error", "Your First Name is blank! Provide your First Name!");
    return res.redirect("/signup");
  }
  if (req.body.password.length < 1) {
    req.flash("error", "Your Password must be atleast 2 characters long!");
    return res.redirect("/signup");
  }
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        const user = await User.create({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            role : req.body.role,
            password : hashedPassword,
        });
        req.login(user, (err) => {
          if(err){
            return res.status(422).json(err);
          }
          if (req.accepts("html")) {
            if(req.user.role == "student"){
              return res.redirect("/dashboard-student");
            }else if(req.user.role == "teacher"){
              return res.redirect("/dashboard-teacher");
            }
          } else {
            return res.json(user);
          }
        })
    }catch(err){
      console.log(error);
      req.flash("error", "Couldn't Create user, Please try again!");
      return res.status(422).json(error);
    }
})

app.get("/login", (request, response) => {
  response.render("login", { csrfToken: request.csrfToken() });
})

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (request, response) {
    try{
      console.log(request.user);
      if(request.user.role == "student"){
        return response.redirect("/dashboard-student");
      }else{
        return response.redirect("/dashboard-teacher");
      }
    }catch(error){
      console.log(error);
      request.flash("error", "Couldn't Login, Please try again!");
      return response.status(422).json(error);
    }
    
  }
);

app.get('/signout', function(req, res, next){
  req.logout((err) => {
    if(err){ return next(err) }
    res.redirect('/');
  });
});

app.get('/dashboard-student', connectEnsureLogin.ensureLoggedIn(), function(req, res){
  res.render("dashboard-student", { user: req.user });
})

app.get('/dashboard-teacher', connectEnsureLogin.ensureLoggedIn(), function(req, res){
  res.render("dashboard-teacher", { user: req.user });
})

app.listen(port, () => {
  console.log(`Capstone Project listening at http://localhost:${port}`)
})
