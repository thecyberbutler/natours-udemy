const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();
    res.json({ status: "success", length: users.length, data: users });
});

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm || req.body.role) {
        return next(
            new AppError("Not allowed to change these properties here.", "400")
        );
    }

    const newData = { ...req.body };
    const user = await User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: newData },
        { new: true, runValidators: true }
    );

    res.json({ status: "success", data: user });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(
        { _id: req.user._id },
        { $set: { active: false } }
    );

    res.status(204).send();
});

exports.createUser = (req, res) => {
    res.status(500).json({ status: "error", message: "not yet implemented" });
};

exports.getUser = (req, res) => {
    res.status(500).json({ status: "error", message: "not yet implemented" });
};

exports.updateUser = (req, res) => {
    res.status(500).json({ status: "error", message: "not yet implemented" });
};

exports.deleteUser = (req, res) => {
    res.status(500).json({ status: "error", message: "not yet implemented" });
};
