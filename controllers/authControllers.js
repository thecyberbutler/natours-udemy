const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { promisify } = require("util");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

const genToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

const createSendToken = (user, statusCode, res) => {
    const token = genToken(user._id);

    const cookieOptions = {
        httpOnly: true,
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
        ),
    };
    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

    res.cookie("jwt", token, cookieOptions);
    res.status(statusCode).json({
        status: "success",
        token,
        data: user,
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });
    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError("Please provide email and password", 400));
    }
    const user = await User.findOne({ email, active: true });
    if (!user) {
        return next(new AppError("Authentication failed", 401));
    }
    const result = await user.checkPassword(password);
    if (result) {
        return createSendToken(user, 200, res);
    }
    return next(new AppError("Authentication failed", 401));
});

exports.protect = catchAsync(async (req, res, next) => {
    // Check for token
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next(new AppError("Resource not found", 404));
    }
    // Validate token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check for valid user
    const user = await User.findById(decoded.id);
    if (!user) {
        return next(new AppError("Resource not found", 404));
    }
    if (user.checkPasswordChange(decoded.iat)) {
        return next(new AppError("Invalid token", 401));
    }

    req.user = user;
    next();
});

exports.restrictTo =
    (...roles) =>
    (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError("Unauthorized to access", 403));
        }
        next();
    };

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
        const token = user.createPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Send Email
        // Generate URL
        const resetURL = `${req.protocol}://${req.get(
            "host"
        )}/api/v1/users/resetPassword/${token}`;

        const message = `Submit patch request with new password and passwordConfirm to: ${resetURL}\n\nIf you didnt forget your password, please ignore this email.`;

        await sendEmail({
            email: user.email,
            subject: "Your password reset token",
            message,
        });
    }

    res.json({
        status: "success",
        message: "If email exists, password reset was sent.",
    });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // Get user from token
    const hashToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    // Check token
    if (!user) {
        return next(new AppError("Token is invalid", 400));
    }

    // Update values
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Log in User
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const { currentPassword, password, passwordConfirm } = req.body;
    const user = await User.findOne({ _id: req.user._id }).select("+password");
    if (!(await user.checkPassword(currentPassword, user.password))) {
        return next(new AppError("Wrong current password", "401"));
    }
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();

    createSendToken(user, 201, res);
});
