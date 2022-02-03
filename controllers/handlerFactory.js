const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

exports.getOne = (Model, populateOptions) =>
    catchAsync(async (req, res, next) => {
        const query = Model.findById(req.params.id);
        if (populateOptions) query.populate(populateOptions);
        const doc = await query;
        if (!doc) {
            return next(
                new AppError(`No resource found with id ${req.params.id}`, 404)
            );
        }
        res.json({ status: "success", data: doc });
    });

exports.getAll = (Model) =>
    catchAsync(async (req, res, next) => {
        // Hack for nested get requests
        let filter = {};
        if (req.params.tourId) filter = { tour: req.params.tourId };

        //Execute Query
        const features = new APIFeatures(Model.find(filter), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const docs = await features.query;
        res.json({
            status: "success",
            count: docs.length,
            data: docs,
        });
    });

exports.createOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const newDoc = await Model.create(req.body);
        res.status(201).json({ status: "success", data: newDoc });
    });

exports.updateOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!doc) {
            return next(
                new AppError(`No resource found with id ${req.params.id}`, 404)
            );
        }
        res.status(202).json({ status: "success", data: doc });
    });

exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return next(
                new AppError(`No resource found with id ${req.params.id}`, 404)
            );
        }
        res.status(204).send();
    });
