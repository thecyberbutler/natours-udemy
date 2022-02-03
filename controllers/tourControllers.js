const Tour = require("../models/tourModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = 5;
    req.query.sort = "-ratingsAverageprice";
    req.query.fields = "name,price,ratingsAverage,summary,difficulty";
    next();
};

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
            $group: {
                _id: { $toUpper: "$difficulty" },
                numTours: { $sum: 1 },
                numRatings: { $sum: "$ratingsQuantity" },
                avgRating: { $avg: "$ratingsAverage" },
                avgPrice: { $avg: "$price" },
                minPrice: { $min: "$price" },
                maxPrice: { $max: "$price" },
            },
        },
        {
            $sort: { avgPrice: 1 },
        },
        // {
        //     $match: { _id: { $ne: "EASY" } },
        // },
    ]);
    res.json({
        status: "success",
        data: stats,
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
        {
            $unwind: "$startDates",
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(year, 1, 1),
                    $lte: new Date(year, 12, 31),
                },
            },
        },
        {
            $group: {
                _id: { $month: "$startDates" },
                numTourStarts: { $sum: 1 },
                tours: { $push: "$name" },
            },
        },
        {
            $addFields: { month: "$_id" },
        },
        {
            $project: {
                _id: 0,
            },
        },
        {
            $sort: { month: 1 },
        },
    ]);

    res.json({
        status: "success",
        data: plan,
    });
});

exports.toursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, long] = latlng.split(",");

    const radius = unit === "miles" ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !long) {
        return new AppError(
            "Must define latitude and longitude in format lat,long.",
            400
        );
    }

    const tours = await Tour.find({
        startLocation: {
            $geoWithin: { $centerSphere: [[long, lat], radius] },
        },
    });

    res.json({
        status: "success",
        count: tours.length,
        data: tours,
    });
});

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, long] = latlng.split(",");

    if (!lat || !long) {
        return new AppError(
            "Must define latitude and longitude in format lat,long.",
            400
        );
    }

    const multiplier = unit === "miles" ? 0.00062 : 0.001;

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: "point",
                    coordinates: [long * 1, lat * 1],
                },
                distanceField: "distance",
                distanceMultiplier: multiplier,
            },
        },
        {
            $project: {
                name: 1,
                distance: 1,
            },
        },
    ]);

    res.json({
        status: "success",
        data: distances,
    });
});

exports.getAllTours = factory.getAll(Tour);
exports.createNewTours = factory.createOne(Tour);
exports.getTour = factory.getOne(Tour, { path: "reviews" });
exports.patchTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
