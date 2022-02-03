const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            required: [true, "A name is required"],
            type: String,
            trim: true,
        },
        email: {
            required: [true, "A email is required"],
            type: String,
            unique: true,
            trim: true,
            lowercase: true,
            validate: [validator.isEmail, "Please use a valid email"],
        },
        photo: {
            type: String,
            trim: true,
        },
        role: {
            type: String,
            enum: ["admin", "user", "guide", "lead-guide"],
            default: "user",
        },
        password: {
            required: [true, "A password is required"],
            type: String,
            trim: true,
            minlength: [8, "Please use at least 8 characters"],
        },
        passwordConfirm: {
            required: [true, "A confirmed password is required"],
            type: String,
            trim: true,
            validate: {
                validator: function (el) {
                    return el === this.password;
                },
                message: "Passwords do not match",
            },
        },
        passwordChangedAt: {
            type: Date,
            default: Date.now(),
        },
        passwordResetToken: {
            type: String,
        },
        passwordResetExpires: {
            type: Date,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        toJSON: {
            transform: function (doc, ret) {
                delete ret.password;
                delete ret.passwordConfirm;
                delete ret.passwordChangedAt;
                delete ret.active;
                delete ret.__v;
                return ret;
            },
        },
        timestamps: true,
        validateBeforeSave: false,
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(
        this.password,
        process.env.PASS_SALT_LENGTH * 1
    );
    this.passwordConfirm = undefined;
    this.passwordChangedAt = Date.now();
    return next();
});

userSchema.pre(/^find/, function (next) {
    this.find({ active: true });
    next();
});

userSchema.methods.checkPassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.checkPasswordChange = function (issuedAt) {
    if (new Date(issuedAt) > new Date(this.passwordChangedTime)) {
        return true;
    }
    return false;
};

userSchema.methods.createPasswordToken = function () {
    const token = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return token;
};

const User = new mongoose.model("User", userSchema);

User.on("index", (err) => {
    if (err) {
        // eslint-disable-next-line no-console
        console.log(err);
    }
});

module.exports = User;
