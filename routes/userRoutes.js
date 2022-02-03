const express = require("express");
const userController = require("../controllers/userControllers");
const authController = require("../controllers/authControllers");

// eslint-disable-next-line new-cap
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// Requires auth for all routes below...
router.use(authController.protect);

router.patch("/updatePassword", authController.updatePassword);

router.get("/me", userController.getMe, userController.getUser);
router.patch("/updateMe", userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);

// Only allow admin access
router.use(authController.restrictTo("admin"));

router
    .route("/")
    .get(userController.getAllUsers)
    .post(userController.createUser);
router
    .route("/:id")
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
