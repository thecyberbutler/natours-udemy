const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = 5;
    req.query.sort = "-ratingsAverageprice";
    req.query.fields = "name,price,ratingsAverage,summary,difficulty";
    next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
    //Execute Query
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const tours = await features.query;
    res.json({
        status: "success",
        count: tours.length,
        data: tours,
    });
});

exports.createNewTours = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);
    res.status(201).json({ status: "success", data: newTour });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
        return next(
            new AppError(`No tour found with id ${req.params.id}`, 404)
        );
    }
    res.json({ status: "success", data: tour });
});

exports.patchTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!tour) {
        return next(
            new AppError(`No tour found with id ${req.params.id}`, 404)
        );
    }
    res.status(202).json({ status: "success", data: tour });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
        return next(
            new AppError(`No tour found with id ${req.params.id}`, 404)
        );
    }
    res.status(204).send();
});

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
