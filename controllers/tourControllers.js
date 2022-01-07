const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = 5;
    req.query.sort = "-ratingsAverageprice";
    req.query.fields = "name,price,ratingsAverage,summary,difficulty";
    next();
};

exports.getAllTours = async (req, res) => {
    try {
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
    } catch (err) {
        return res.status(404).json({
            status: "fail",
            message: err,
        });
    }
};

exports.createNewTours = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body);
        res.status(201).json({ status: "success", data: newTour });
    } catch (err) {
        return res.status(400).json({
            status: "failure",
            message: err,
        });
    }
};

exports.getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        res.json({ status: "success", data: tour });
    } catch (err) {
        return res.status(404).json({
            status: "failure",
            message: `No tour with id ${req.params.id} found.`,
        });
    }
};

exports.patchTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(202).json({ status: "success", data: tour });
    } catch (err) {
        res.status(400).json({ status: "failure", message: err });
    }
};

exports.deleteTour = async (req, res) => {
    try {
        await Tour.findbyIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(400).json({ status: "failure", message: err });
    }
    res.status(204).send();
};

exports.getTourStats = async (req, res) => {
    try {
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
    } catch (err) {
        return res.status(400).json({
            status: "failure",
            message: err,
        });
    }
};

exports.getMonthlyPlan = async (req, res) => {
    try {
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
    } catch (err) {
        return res.status(400).json({
            status: "failure",
            message: err,
        });
    }
};
