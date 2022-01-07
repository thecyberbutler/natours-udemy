const express = require("express");
const tourController = require("../controllers/tourControllers");

// eslint-disable-next-line new-cap
const router = express.Router();

router
    .route("/")
    .get(tourController.getAllTours)
    .post(tourController.createNewTours);

router.route("/get-tour-stats").get(tourController.getTourStats);

router.route("/get-monthly-plan/:year").get(tourController.getMonthlyPlan);

router
    .route("/top-5-cheap")
    .get(tourController.aliasTopTours, tourController.getAllTours);

router
    .route("/:id")
    .get(tourController.getTour)
    .patch(tourController.patchTour)
    .delete(tourController.deleteTour);

module.exports = router;
