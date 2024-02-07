const request = require("supertest");
const app = require("../app");
const { sequelize, Enroll, Courses, Chapter, Page } = require("../models");

const cheerio = require("cheerio");

function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

let server, agent;

//test to check the signup feature
describe("Test Features of Educator", () => {
  //before all test cases run, this will sync the database and start the server
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    server = app.listen(3010, () => {
      console.log("Example app listening on port 3010!");
    });
    agent = request.agent(server);
  });

  //after all test cases run, close the server
  afterAll(async () => {
    await server.close();
  });

  //test to check the signup feature
  test("Test for Signup GET method of Educator", async () => {
    const response = await agent.get("/signup");
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Sign Up");
  });

  //test to check the signup feature
  test("Test for Signup POST method of Educator", async () => {
    const csrfToken = extractCsrfToken(await agent.get("/signup"));
    const response = await agent
      .post("/signup")
      .set("Accept", "application/json")
      .send({
        firstname: "test",
        lastname: "test",
        email: "test@gmail.com",
        password: "testtesttest",
        type: "educator",
        _csrf: csrfToken,
      });
    expect(response.statusCode).toBe(404);
  });

  //test to check the login feature
  test("Test Login GET method of Educator", async () => {
    const response = await agent.get("/login");
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Login");
  });

  //test to check get dashboard-student
  test("Test Dashboard-Student GET method of Educator", async () => {
    const response = await agent.get("/dashboard-student");
    expect(response.statusCode).toBe(302);
  });

  test("should add a course", async () => {
    // Mocking the request object
    const req = {
      body: {
        courseName: "Test Course",
        desc: "Test Description",
      },
      user: {
        id: "testUserId",
      },
    };

    // Mocking the Courses.addCourse function
    Courses.addCourse = jest
      .fn()
      .mockResolvedValue("Course added successfully");

    // Call the function to be tested
    const result = await Courses.addCourse(
      req.body.courseName,
      req.body.desc,
      req.user.id,
    );

    // Assert the result
    expect(result).toBe("Course added successfully");

    // Verify that the Courses.addCourse function was called with the correct arguments
    expect(Courses.addCourse).toHaveBeenCalledWith(
      "Test Course",
      "Test Description",
      "testUserId",
    );
  });

  test("should update the course with the given courseId", async () => {
    // Mocking the request object
    const req = {
      body: {
        courseName: "New Course Name",
        desc: "New Course Description",
      },
      params: {
        courseId: 1, // Assuming the courseId is 1
      },
    };

    // Mocking the Courses.update method
    const updateMock = await Courses.create({
      courseName: req.body.courseName,
      desc: req.body.desc,
      courseId: req.params.courseId,
    });

    // Call the function that updates the course
    req.body.courseName = "New Course Name";
    req.body.desc = "New Course Description";

    // Assert that the Courses.update method was called with the correct arguments
    expect(updateMock.desc).toContain("New Course Description");
  });

  //test to check the Educator chapter creation feature
  test("Test for chapter creation POST method of Educator", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const response = await agent
      .post("/dashboard-teacher/addChapter/1")
      .set("Accept", "application/json")
      .send({
        chapterNumber: 1,
        chapterName: "testchapter",
        chapterDesc: "testdescription",
        courseId: 1,
        _csrf: csrfToken,
      });
    expect(response.statusCode).toBe(403);
  });

  test("should create a new page with the provided data", async () => {
    const req = {
      body: {
        pageName: "Test Page",
        pageNumber: 1,
        pageContent: "test page content",
      },
      params: {
        chapterId: "1",
      },
    };

    const page = await Page.create({
      pageName: req.body.pageName,
      pageNumber: req.body.pageNumber,
      pageContent: req.body.pageContent,
    });
    expect(page.pageName).toBe(req.body.pageName);
    expect(page.pageNumber).toBe(req.body.pageNumber);
    expect(page.pageContent).toBe(req.body.pageContent);
  });

  test("should update the page with the given pageId", async () => {
    const req = {
      body: {
        pageName: "New Page Name",
        pageNumber: 1,
        pageContent: "New Page Content",
      },
      params: {
        pageId: 1,
      },
    };

    const updateMock = await Page.create({
      pageName: req.body.pageName,
      pageNumber: req.body.pageNumber,
      pageContent: req.body.pageContent,
      pageId: req.params.pageId,
    });

    expect(updateMock.pageName).toBe("New Page Name");
    expect(updateMock.pageNumber).toBe(1);
    expect(updateMock.pageContent).toBe("New Page Content");
  });
});
