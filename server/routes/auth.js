const router = require("express").Router();
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;
const User = require("../models").user;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

router.use((req, res, next) => {
  console.log("正在接收一個auth request...");
  next();
});

//測試
router.get("/testAPI", (req, res) => {
  return res.send("成功連接auth route");
});

//註冊
router.post("/register", async (req, res) => {
  //確認數據是否符合rules
  let { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //確認email是否已被註冊
  const isEmailExist = await User.findOne({ email: req.body.email });
  if (isEmailExist)
    return res.status(400).send("this email has been registered");

  //新增user
  let { username, password, email, role } = req.body;
  try {
    let newUser = new User({ username, password, email, role });
    const savedUser = await newUser.save();
    return res.status(200).send({
      msg: "new user has saved successfully.",
      savedUser,
    });
  } catch (e) {
    return res.status(500).send("無法儲存user...");
  }
});

//登入
router.post("/login", async (req, res) => {
  //確認數據是否符合rules
  let { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //比對密碼
  const foundUser = await User.findOne({ email: req.body.email });
  if (!foundUser)
    return res.status(401).send(" Can't find user , 檢查email有無錯誤");

  foundUser.comparePassword(req.body.password, (err, isMatch) => {
    if (err) return res.status(500).send(err);

    // console.log("真正密碼：" + foundUser.password);
    // console.log("你輸入的密碼:" + req.body.password);
    // const testIsMatch = await bcrypt.compare(
    //   req.body.password,
    //   foundUser.password
    // );
    // console.log("密碼是否匹配: ", testIsMatch);

    //密碼正確
    if (isMatch) {
      //製作jwt
      const tokenObject = { _id: foundUser._id, email: foundUser.email };
      const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
      return res.send({
        message: "成功登入",
        token: "JWT " + token,
        user: foundUser,
      });
    } else {
      return res.status(401).send("密碼錯誤");
    }
  });
});

module.exports = router;
