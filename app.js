const express = require("express");
const morgan = require("morgan");
const AppError = require("./utils/appError");
const globalError = require("./controllers/errorControllers");

// const swaggerUi = require("swagger-ui-express");
// const swaggerDocument = require("./swagger.json");

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
// eslint-disable-next-line new-cap
const apiV1 = express.Router();
app.use("/api/v1", apiV1);

apiV1.use("/tours", tourRouter);
apiV1.use("/users", userRouter);

// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

app.use(globalError);

module.exports = app;
