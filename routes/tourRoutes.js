const express = require("express");
const fs = require("fs");
const tourController = require("./../controllers/tourControllers");

const router = express.Router();

router
    .route("/")
    .get(tourController.getAllTours)
    .post(tourController.createNewTours);

router
    .route("/:id")
    .get(tourController.getTour)
    .patch(tourController.patchTour)
    .delete(tourController.deleteTour);

module.exports = router;
