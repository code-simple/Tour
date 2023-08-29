const express = require("express");
const tourController = require("./../controllers/tourControllers");

const router = express.Router();
router.param("id", tourController.checkID); // This Middleware will check all params having id and check its value

router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour); // checkBody middleware is used to check body before running createTour

router
  .route("/:id")
  .get(tourController.getTour)
  .delete(tourController.deleteTour)
  .patch(tourController.updateTour);

module.exports = router;
