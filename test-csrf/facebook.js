const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const database = [];
const PORT = 3000;
const app = express();

// Sử dụng cookie-parser để đọc cookie dễ dàng hơn thông qua req.cookies
app.use(cookieParser());

// Sử dụng body-parser để đọc body form data dễ dàng hơn thông qua req.body
app.use(bodyParser.urlencoded({ extended: false }));

const authMiddleware = (req, res, next) => {
  // Kiểm tra xem người dùng đã đăng nhập chưa
  if (req.cookies.username !== "John Doe") {
    return res
      .status(401)
      .send(
        `<div>Xin chào! Để đăng nhập vui lòng vào đường dẫn <a href='/login'>/login</a></div>`
      );
  }
  next();
};

app.get("/login", (req, res) => {
  res.cookie("username", "John Doe", {
    maxAge: 3600 * 1000,
    httpOnly: true,
  });
  res.send(`
  <div>Chúc mừng John Doe đã đăng nhập thành công!</div>
  <div>Quay lại <a href='/'>trang chủ</a> để đăng bài</div>
  `);
});

app.post("/status", authMiddleware, (req, res) => {
  // Thêm bài viết vào database
  const { content } = req.body;
  database.push(content);
  res.send(
    `<div>Bạn đã đăng bài thành công, quay lại <a href='/'>trang chủ</a> để xem bài viết của bạn</div>`
  );
});

// Trang chủ
app.get("/", authMiddleware, (req, res) => {
  // Nếu đã đăng nhập thì hiển thị form đăng bài và các bài đã đăng
  res.send(`
  <html><body>
  <form action='/status' method='post'>
    <textarea type="text" placeholder="Bạn đang nghĩ gì" name="content"></textarea>
    <button type="submit">Đăng bài</button>
  </form>
  <div>Các bài đã đăng</div>
  ${database.map((content) => `<p>${content}</p>`).join("")}
  </body></html>
  `);
});

app.listen(PORT, () => {
  console.log(`Facebook Server is running on http://localhost:${PORT}`);
});
