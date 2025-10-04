const express = require("express");
const dotenv = require("dotenv");
const connectToDB = require('./config/db')
connectToDB();
const bodyParser = require('body-parser');
const cors = require('cors');

dotenv.config();
const app = express();
const apiRoutes = require("./routes/api.routes");
const chatRoutes = require("./routes/chat.routes");
const graphRoutes = require("./routes/graph.routes");
const userRouter = require('./routes/user.routes');
const cookieParser = require('cookie-parser');


// middlewares
app.use(cookieParser());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors());
app.use(bodyParser.json());



app.use("/api", apiRoutes);
app.use("/chat", chatRoutes);
app.use("/graph", graphRoutes);
app.use('/user', userRouter);



app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/storyline", (req, res) => {
  res.render("story");
});

app.listen(3004, () => {
  console.log("Server running on port 3000");
});