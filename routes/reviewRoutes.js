const express = require("express");
const reviewController = require("../controllers/reviewControllers");
const authController = require("../controllers/authControllers");

// eslint-disable-next-line new-cap
const router = express.Router({ mergeParams: true });

// Only authenticated can view reviews
router.use(authController.protect);

router
    .route("/")
    .get(reviewController.getAllReviews)
    .post(
        authController.restrictTo("user"),
        reviewController.setTourUserIds,
        reviewController.createReview
    );

router
    .route("/:id")
    .get(reviewController.getReview)
    .patch(
        authController.restrictTo("admin", "user"),
        reviewController.updateReview
    )
    .delete(
        authController.restrictTo("admin", "user"),
        reviewController.deleteReview
    );

module.exports = router;
