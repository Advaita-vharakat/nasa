const express = require("express");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

// middlewares
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
const apiRoutes = require("./routes/api.routes");
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.render("index");
});


app.listen(3008, () => {
  console.log("Server running on port 3000");
});