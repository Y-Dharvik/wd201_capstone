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
const { Courses, User, Chapter, Page, Enroll } = require("./models");
const bodyParser = require("body-parser");
const chapter = require("./models/chapter");


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
app.get("/", async (req, res) => {
    if(req.isAuthenticated()){
      if(req.user.role == "student"){
        return res.redirect("/dashboard-student", { user: req.user, courses: Courses });
      }else if(req.user.role == "teacher"){
        return res.redirect("/dashboard-teacher", { user: req.user, courses: Courses });
      }
    }
    res.render("default-page", );
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
  const user = await User.findOne({ where: { email: req.body.email } });
  if (user) {
    req.flash("error", "User with this email already exists!");
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

app.get('/dashboard-student', connectEnsureLogin.ensureLoggedIn(), async (req, res) =>{
  // student has to see all the available courses created by all the teachers
  const courses = await Courses.findAll()
  console.log("courses found")
  const enroledCourses = await Enroll.findAll({where : {userId : req.user.id, isEnrolled : true}});
  const enroledCoursesDetails = [];
  for(let i = 0; i < enroledCourses.length; i++){
    const course = await Courses.findOne({where : {id : enroledCourses[i].courseId}});
    enroledCoursesDetails.push(course);
  }
  try{
    console.log(courses);
    res.render("dashboard-student", { user: req.user, courses: courses, enroledCourses: enroledCoursesDetails, csrfToken: req.csrfToken()});
  }
  catch(error){
    console.log(error);
    req.flash("error", "Couldn't Load dashboard, Please try again!");
    return res.status(422).json(error);
  }
})

app.get('/dashboard-teacher', connectEnsureLogin.ensureLoggedIn(), function(req, res){
  const courses = Courses.findAll({where : {creatorId : req.user.id}})
  .then((courses) => {
    console.log(courses);
    res.render("dashboard-teacher", { user: req.user, courses: courses, csrfToken: req.csrfToken()});
  })
})

app.get('/dashboard-teacher/addCourse', connectEnsureLogin.ensureLoggedIn(), function(req, res){
  res.render("addCourse", { user: req.user, csrfToken: req.csrfToken()});
})

app.post('/dashboard-teacher/addCourse', async(req, res) => {
  try{
    const course = await Courses.addCourse(req.body.courseName, req.body.desc, req.user.id);
    if(req.accepts("html")){
      flash("success", "Course Created Successfully!");
      return res.redirect("/dashboard-teacher");
    }else{
      return res.json(course);
    }
  }catch(error){
    console.log(error);
    req.flash("error", "Couldn't Create course, Please try again!");
    return res.status(422).json(error);
  }
})

app.get('/dashboard-teacher/editCourse/:courseId', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  const courses = await Courses.findOne({where : {id : req.params.courseId}});
  const chapters = await Chapter.findAll({where : {id : req.params.courseId}});
  console.log(courses);
  console.log(chapters);
  res.render("editCourse", { user: req.user, courses: courses, chapters : chapters, csrfToken: req.csrfToken()});
  
})

app.post('/dashboard-teacher/editCourse/:courseId', async(req, res) => {
  if(req.body.courseName.length == 0){
    req.flash("error", "Course Name cannot be blank!");
    return res.redirect("/dashboard-teacher/editCourse/" + req.params.courseId);
  }
  if(req.body.desc.length == 0){
    req.flash("error", "Course Description cannot be blank!");
    return res.redirect("/dashboard-teacher/editCourse/" + req.params.courseId);
  }
  try{
    const course = await Courses.update({courseName:req.body.courseName, desc:req.body.desc} , {where : {id : req.params.courseId}});
    if(req.accepts("html")){
      req.flash("success", "Course Edited Successfully!");
      return res.redirect("/dashboard-teacher/editCourse/" + req.params.courseId);
    }else{
      return res.json(course);
    }
  }catch(error){
    console.log(error);
    req.flash("error", "Couldn't Edit course, Please try again!");
    return res.status(422).json(error);
  }
})

app.get('/dashboard-teacher/addChapter/:courseId', connectEnsureLogin.ensureLoggedIn(), function(req, res){
  console.log("got + "+req.params.courseId);
  res.render("addChapter", { user: req.user, courseId: req.params.courseId, csrfToken: req.csrfToken()});
})

app.post('/dashboard-teacher/addChapter/:courseId', connectEnsureLogin.ensureLoggedIn(), async(req, res) => {
  if(req.body.chapterNumber.length == 0){
    req.flash("error", "Chapter Number cannot be blank!");
    return res.redirect("/dashboard-teacher/addChapter/" + req.params.courseId);
  }
  if(req.body.chapterName.length == 0){
    req.flash("error", "Chapter Name cannot be blank!");
    return res.redirect("/dashboard-teacher/addChapter/" + req.params.courseId);
  }
  if(req.body.chapterDesc.length == 0){
    req.flash("error", "Chapter Description cannot be blank!");
    return res.redirect("/dashboard-teacher/addChapter/" + req.params.courseId);
  }

  try{
    const chapter = await Chapter.create({
      chapterName : req.body.chapterName,
      chapterNumber : req.body.chapterNumber,
      chapterDesc: req.body.chapterDesc,
      courseId: req.params.courseId,
    })
    if(req.accepts("html")){
      req.flash("success", "Chapter Added Successfully!");
      return res.redirect("/dashboard-teacher/editCourse/" + req.params.courseId);
    }else{
      return res.json(course);
    }
  }catch(error){
    console.log(error);
    req.flash("error", "Couldn't Create chapter, Please try again!");
    return res.status(422).json(error);
  }
})

app.get('/dashboard-teacher/editChapter/:chapterId', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  const chapter = await Chapter.findOne({where : {id : req.params.chapterId}});
  const pages = await Page.findAll({where : {chapterId : req.params.chapterId}});
  console.log(chapter);
  console.log(pages);
  res.render("editChapter", { user: req.user, chapter: chapter, pages : pages, csrfToken: req.csrfToken()});
})

app.post('/dashboard-teacher/editChapter/:chapterId', async(req, res) => {
  if(req.body.chapterName.length == 0){
    req.flash("error", "Chapter Name cannot be blank!");
    return res.redirect("/dashboard-teacher/editChapter/" + req.params.chapterId);
  }
  if(req.body.chapterDesc.length == 0){
    req.flash("error", "Chapter Description cannot be blank!");
    return res.redirect("/dashboard-teacher/editChapter/" + req.params.chapterId);
  }
  try{
    const chapter = await Chapter.update({chapterName:req.body.chapterName, chapterNumber:req.body.chapterNumber, chapterDesc:req.body.chapterDesc} , {where : {id : req.params.chapterId}});
    if(req.accepts("html")){
      req.flash("success", "Chapter Edited Successfully!");
      return res.redirect("/dashboard-teacher/editChapter/" + req.params.chapterId);
    }else{
      return res.json(chapter);
    }
  }catch(error){
    console.log(error);
    req.flash("error", "Couldn't Edit chapter, Please try again!");
    return res.status(422).json(error);
  }
})

app.get('/dashboard-teacher/addPage/:chapterId', connectEnsureLogin.ensureLoggedIn(), function(req, res){
  console.log("got + "+req.params.chapterId);
  res.render("addPage", { user: req.user, chapterId: req.params.chapterId, csrfToken: req.csrfToken()});
})

app.post('/dashboard-teacher/addPage/:chapterId', connectEnsureLogin.ensureLoggedIn(), async(req, res) => {
  if(req.body.pageNumber.length == 0){
    req.flash("error", "Page Number cannot be blank!");
    return res.redirect("/dashboard-teacher/addPage/" + req.params.chapterId);
  }
  if(req.body.pageName.length == 0){
    req.flash("error", "Page Name cannot be blank!");
    return res.redirect("/dashboard-teacher/addPage/" + req.params.chapterId);
  }
  if(req.body.pageContent.length == 0){
    req.flash("error", "Page Content cannot be blank!");
    return res.redirect("/dashboard-teacher/addPage/" + req.params.chapterId);
  }

  try{
    const page = await Page.create({
      pageName : req.body.pageName,
      pageNumber : req.body.pageNumber,
      pageContent: req.body.pageContent,
      chapterId: req.params.chapterId,
    })
    if(req.accepts("html")){
      req.flash("success", "Page Added Successfully!");
      return res.redirect("/dashboard-teacher/editChapter/" + req.params.chapterId);
    }else{
      return res.json(page);
    }
  }catch(error){
    console.log(error);
    req.flash("error", "Couldn't Create page, Please try again!");
    return res.status(422).json(error);
  }
})

app.get('/dashboard-teacher/editPage/:pageId', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  const page = await Page.findOne({where : {id : req.params.pageId}});
  res.render("editPage", { user: req.user, page: page, chapterId: page.chapterId, csrfToken: req.csrfToken()});
})

app.post('/dashboard-teacher/editPage/:pageId', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  if(req.body.pageName.length == 0){
    req.flash("error", "Page Name cannot be blank!");
    return res.redirect("/dashboard-teacher/editPage/" + req.params.pageId);
  }
  if(req.body.pageContent.length == 0){
    req.flash("error", "Page Content cannot be blank!");
    return res.redirect("/dashboard-teacher/editPage/" + req.params.pageId);
  }
  try{
    const page = await Page.update({pageName:req.body.pageName, pageContent:req.body.pageContent} , {where : {id : req.params.pageId}});
    if(req.accepts("html")){
      req.flash("success", "Page Edited Successfully!");
      return res.redirect("/dashboard-teacher/editChapter/" + req.body.chapterId);
    }else{
      return res.json(page);
    }
  }catch(error){
    console.log(error);
    req.flash("error", "Couldn't Edit page, Please try again!");
    return res.status(422).json(error);
  }
})

app.get('/dashboard-student/viewCourse/:courseId', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  const course = await Courses.findOne({where : {id : req.params.courseId}});
  const creator = await User.findOne({where : {id : course.creatorId}});
  const chapters = await Chapter.findAll({where : {courseId : req.params.courseId}});
  console.log(course);
  console.log(chapters);
  res.render("viewCourse", { user: req.user, course: course, creatorName: creator.firstName, chapters : chapters, csrfToken: req.csrfToken()});
});

app.get('/dashboard-student/previewCourse/:courseId', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  const course = await Courses.findOne({where : {id : req.params.courseId}});
  const creator = await User.findOne({where : {id : course.creatorId}});
  const chapters = await Chapter.findAll({where : {courseId : req.params.courseId}});
  console.log(course);
  console.log(chapters);
  res.render("previewCourse", { user: req.user, course: course, creatorName: creator.firstName, chapters : chapters, csrfToken: req.csrfToken()});
});

app.get('/dashboard-student/viewChapter/:chapterId', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  const chapter = await Chapter.findOne({where : {id : req.params.chapterId}});
  const pages = await Page.findAll({where : {chapterId : req.params.chapterId}});
  console.log(chapter);
  console.log(pages);
  res.render("viewChapter", { user: req.user, chapter: chapter, pages : pages, csrfToken: req.csrfToken()});
})

app.get('/dashboard-student/enroll/:courseId', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  try{
    const enroll = await Enroll.create({
      courseId : req.params.courseId,
      userId : req.user.id,
      isEnrolled : true,
    })
    if(req.accepts("html")){
      req.flash("success", "Course Enrolled Successfully!");
      return res.redirect("/dashboard-student");
    }else{
      return res.json(enroll);
    }
  }catch(error){
    console.log(error);
    req.flash("error", "Couldn't Enroll course, Please try again!");
    return res.status(422).json(error);
  }
})

app.listen(port, () => {
  console.log(`Capstone Project listening at http://localhost:${port}`)
})
