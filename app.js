const express = require("express");
const morgan = require("morgan");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

// Middleware
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// Routes
const apiV1 = express.Router();
app.use("/api/v1", apiV1);

apiV1.use("/tours", tourRouter);
apiV1.use("/users", userRouter);

module.exports = app;
