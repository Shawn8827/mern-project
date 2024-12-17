const router = require("express").Router();
const Course = require("../models").course;
const courseValidation = require("../validation").courseValidation;

/*
" / " for " /api/courses "
*/

//看所有Courses
router.get("/", async (req, res) => {
  try {
    let courseFound = await Course.find({})
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(courseFound);
  } catch (error) {
    return res.status(500).send(error);
  }
});

//用course name 查課
router.get("/findByName/:name", async (req, res) => {
  let { name } = req.params;
  try {
    let courseFound = await Course.find({ title: name })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(courseFound);
  } catch (error) {
    return res.status(500).send(error);
  }
});

//用course id 查課
router.get("/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let courseFound = await Course.find({ _id })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(courseFound);
  } catch (error) {
    return res.status(500).send(error);
  }
});

//用student id 查已註冊的課程
router.get("/student/:_student_id", async (req, res) => {
  let { _student_id } = req.params;
  try {
    let coursesFound = await Course.find({ students: _student_id })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(coursesFound);
  } catch (error) {
    return res.status(500).send(error);
  }
});

//用instructor id 查詢課程
router.get("/instructor/:_instructor_id", async (req, res) => {
  let { _instructor_id } = req.params;
  try {
    let coursesFound = await Course.find({ instructor: _instructor_id })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(coursesFound);
  } catch (error) {
    return res.status(500).send(error);
  }
});

//新增course
router.post("/", async (req, res) => {
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.user.isStudent()) {
    return res.status(400).send("只有講師才能發佈課程");
  }
  let { title, description, price } = req.body;
  try {
    let newCourse = new Course({
      title,
      description,
      price,
      instructor: req.user._id,
    });
    let savedCourse = await newCourse.save();
    return res.send({
      message: "已建立課程",
      savedCourse,
    });
  } catch (error) {
    return res.status(500).send("無法建立課程");
  }
});

//讓student 透過 course._id enroll 某個課程
router.post("/enroll/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let course = await Course.findOne({ _id }).exec();
    course.students.push(req.user._id);
    await course.save();
    return res.send("註冊成功");
  } catch (error) {
    return res.send(error);
  }
});

//更改課程內容
router.patch("/:_id", async (req, res) => {
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let { _id } = req.params;

  //確認課程存在
  try {
    let courseFound = await Course.findOne({ _id });
    if (!courseFound) return res.status(400).send("Can't find the course");

    //確認更改者身份
    if (courseFound.instructor.equals(req.user._id)) {
      let updatedCourse = await Course.findOneAndUpdate({ _id }, req.body, {
        new: true,
        runValidator: true,
      });
      return res.send({
        msg: "更改成功",
        updatedCourse,
      });
    } else {
      return res.status(403).send("只有此課程的老師能編輯");
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

//刪除課程
router.delete("/:_id", async (req, res) => {
  let { _id } = req.params;
  //確認課程存在
  try {
    let courseFound = await Course.findOne({ _id }).exec();
    if (!courseFound) return res.status(400).send("Can't find the course");

    //確認操作者身份
    if (courseFound.instructor.equals(req.user._id)) {
      let deletedCourse = await Course.findOneAndDelete({ _id }).exec();
      return res.send({
        msg: "刪除成功",
        deletedCourse,
      });
    } else {
      return res.status(403).send("只有此課程的老師能刪除");
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

module.exports = router;
