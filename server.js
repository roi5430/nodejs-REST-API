const mongoose = require("mongoose");

const app = require("./app");

const BD_HOST =
  "mongodb+srv://oksanarobeiko:jrcfyf99@cluster0.gbbcn6s.mongodb.net/db-contacts?retryWrites=true&w=majority";

mongoose.set("strictQuery", true);

mongoose
  .connect(BD_HOST)
  .then(() => {
    app.listen(3000);
    console.log("Database connection successful");
  })
  .catch((err) => {
    console.log(err.message);
    process.exit(1);
  });

// app.listen(3000, () => {
//   console.log("Server running. Use our API on port: 3000");
// });
