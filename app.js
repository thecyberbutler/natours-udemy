const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const MongoStore = require("rate-limit-mongo");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./docs/swagger");

const AppError = require("./utils/appError");
const globalError = require("./controllers/errorControllers");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");

const app = express();

// Security headers
app.use(helmet());

// Middleware
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Rate limiting
const expireTime = 60 * 60 * 1000;
const limiter = rateLimit({
    store: new MongoStore({
        uri: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
        expireTimeMs: expireTime,
    }),
    max: 100,
    windowMs: expireTime,
});

// Body Parser
app.use(express.json({ limit: "10kb" }));

// Data sanataztion
app.use(mongoSanitize());
app.use(xss());
app.use(
    hpp({
        whitelist: ["duration"],
    })
);

// Serve static files
app.use(express.static(`${__dirname}/public`));

// Routes
// eslint-disable-next-line new-cap
const apiV1 = express.Router();
app.use("/api/v1", apiV1);

apiV1.use(limiter);
apiV1.use("/tours", tourRouter);
apiV1.use("/users", userRouter);
apiV1.use("/reviews", reviewRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

app.use(globalError);

module.exports = app;
