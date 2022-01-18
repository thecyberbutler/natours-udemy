const express = require("express");
const tourController = require("../controllers/tourControllers");
const authController = require("../controllers/authControllers");

// eslint-disable-next-line new-cap
const router = express.Router();

router
    .route("/")
    .get(authController.protect, tourController.getAllTours)
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
    .delete(
        authController.protect,
        authController.restrictTo("admin"),
        tourController.deleteTour
    );

module.exports = router;
