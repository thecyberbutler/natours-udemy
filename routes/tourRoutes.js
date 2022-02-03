const express = require("express");
const tourController = require("../controllers/tourControllers");
const authController = require("../controllers/authControllers");
const reviewRouter = require("./reviewRoutes");

// eslint-disable-next-line new-cap
const router = express.Router();

router
    .route("/")
    .get(tourController.getAllTours)
    .post(
        authController.protect,
        authController.restrictTo("admin", "lead-guide"),
        tourController.createNewTours
    );

router.route("/get-tour-stats").get(tourController.getTourStats);

router
    .route("/get-monthly-plan/:year")
    .get(
        authController.protect,
        authController.restrictTo("admin", "lead-guide", "guide"),
        tourController.getMonthlyPlan
    );

router
    .route("/top-5-cheap")
    .get(tourController.aliasTopTours, tourController.getAllTours);

router
    .route("/tours-within/:distance/center/:latlng/unit/:unit")
    .get(tourController.toursWithin);

router
    .route("/distances/center/:latlng/unit/:unit")
    .get(tourController.getDistances);
router
    .route("/:id")
    .get(tourController.getTour)
    .patch(
        authController.protect,
        authController.restrictTo("admin", "lead-guide"),
        tourController.patchTour
    )
    .delete(
        authController.protect,
        authController.restrictTo("admin", "lead-guide"),
        tourController.deleteTour
    );

router.use("/:tourId/reviews", reviewRouter);
module.exports = router;
