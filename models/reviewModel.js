const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, "Review must be provided"],
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            required: [true, "A rating must be provided between 0 and 5"],
        },
        tour: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tour",
            required: [true, "A Review must belong to a tour"],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "A Review must belong to a User"],
        },
    },
    {
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                delete ret.__v;
                return ret;
            },
        },
        toObject: {
            virtuals: true,
        },
        timestamps: true,
    }
);

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: "user",
        select: "name photo",
    });
    next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        { $match: { tour: tourId } },
        {
            $group: {
                _id: "$tour",
                numRatings: { $sum: 1 },
                avgRating: { $avg: "$rating" },
            },
        },
    ]);
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            $set: {
                ratingsQuantity: stats[0].numRatings,
                ratingsAverage: stats[0].avgRating,
            },
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            $set: {
                ratingsQuantity: 0,
                ratingsAverage: 4.5,
            },
        });
    }
};

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.post("save", function () {
    this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.model.findOne(this.getQuery());
    next();
});

reviewSchema.post(/^findOneAnd/, async function () {
    await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = new mongoose.model("Review", reviewSchema);

module.exports = Review;
