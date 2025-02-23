const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const connectDb = require("./config/dbConnection");
const dotenv = require("dotenv").config();
const upload = require("./middleware/imageUploadHandler");
const path = require("path");

connectDb();
const app = express(); // create express app instance

const port = process.env.PORT || 5000;

app.use(express.json()); // Middleware to populate and store req body + MUST be 1st
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes")); 
app.use("/api/services", require("./routes/ServiceRoutes"));
app.use("/api/cities", require("./routes/CityRoutes"));
app.use("/api/reservations", require("./routes/ReservationRoutes"));
app.use("/api/proposal", require("./routes/ServiceProposalRoutes"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(errorHandler); // MUST be last (to handle the error when a user tries an api not mentioned above)

// Starts the server
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
