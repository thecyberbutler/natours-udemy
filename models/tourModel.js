const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema(
    {
        name: {
            required: [true, "A tour name must be defined"],
            type: String,
            unique: true,
            trim: true,
            maxlength: [
                40,
                "The maximum length of the tour name must be less than 40 characters",
            ],
            minlength: [
                10,
                "The minimum length of the tour name must be less than 10 characters",
            ],
        },
        duration: {
            type: Number,
            required: [true, "A tour must have a duration"],
        },
        maxGroupSize: {
            type: Number,
            required: [true, "A tour must have a group size"],
        },
        difficulty: {
            type: String,
            required: [true, "A tour must have a difficulty"],
            enum: {
                values: ["easy", "medium", "difficult"],
                message: "Difficulty must be easy, medium, or difficult",
            },
        },
        price: {
            required: [true, "A tour price must be defined"],
            type: Number,
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, "The minimum rating is 1"],
            max: [5, "The maximum rating is 5"],
            set: (val) => Math.round(val * 10) / 10,
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    // Only works with create not update
                    return val < this.price;
                },
            },
            message: "Discount price must be less than the price",
        },
        summary: {
            type: String,
            trim: true,
            required: [true, "A tour must have a summary"],
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, "A tour must have a cover image"],
        },
        images: {
            type: [String],
        },
        startDates: {
            type: [Date],
        },
        slug: {
            type: String,
        },
        secretTour: {
            type: Boolean,
            default: false,
        },
        startLocation: {
            // GeoJSON
            type: {
                type: String,
                default: "Point",
                enum: ["Point", "Only the type of 'Point' is allowed."],
            },
            coordinates: [Number],
            address: String,
            description: String,
        },
        locations: [
            {
                type: {
                    type: String,
                    default: "Point",
                    enum: ["Point", "Only the type of 'Point' is allowed."],
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number,
            },
        ],
        guides: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
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

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });

tourSchema.index({ slug: 1 });

tourSchema.index({ startLocation: "2dsphere" });

tourSchema.virtual("durationWeeks").get(function () {
    return this.duration / 7;
});

tourSchema.virtual("reviews", {
    ref: "Review",
    localField: "_id",
    foreignField: "tour",
});

// Document Middleware
tourSchema.pre("save", function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

//Query Middleware
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });

    this.start = Date.now();
    next();
});

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: "guides",
        select: "-__v -passwordChangedAt",
    });
    next();
});

tourSchema.post(/^find/, function (docs, next) {
    // eslint-disable-next-line no-console
    console.log(`Query took ${Date.now() - this.start} ms`);
    next();
});

// Aggregation Middleware
// tourSchema.pre("aggregate", function (next) {
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//     next();
// });
const Tour = new mongoose.model("Tour", tourSchema);

module.exports = Tour;
