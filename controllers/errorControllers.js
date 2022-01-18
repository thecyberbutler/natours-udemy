const AppError = require("../utils/appError");

const handleCastError = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldError = (err) => {
    const value = err.keyValue.name;
    const message = `Duplicat field value: ${value}. Please use another value.`;
    return new AppError(message, 400);
};

const handleValidationError = (err) => {
    const errorMessages = Object.keys(err.errors).map(
        (error) =>
            `Field "${error}" has the following error: ${err.errors[error].message}`
    );
    const message = `There were data validation errors:\n ${errorMessages.join(
        ",\n"
    )}`;
    return new AppError(message, 400);
};

const handleJsonWebTokenError = () => new AppError("Invalid token", 401);

const handleExpiredWebTokenError = () => new AppError("Token Expired", 401);

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message || err._message,
        });
    } else {
        // eslint-disable-next-line no-console
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Something went wrong",
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === "production") {
        let error = { ...err };
        error.name = err.name;
        if (error.name === "CastError") {
            error = handleCastError(error);
        } else if (error.code === 11000) {
            error = handleDuplicateFieldError(error);
        } else if (error.name === "ValidationError") {
            error = handleValidationError(error);
        } else if (error.name === "JsonWebTokenError") {
            error = handleJsonWebTokenError();
        } else if (error.name === "TokenExpiredError") {
            error = handleExpiredWebTokenError();
        }
        sendErrorProd(error, res);
    }
};
