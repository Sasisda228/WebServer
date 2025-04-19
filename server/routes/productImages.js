const express = require("express");
const multer = require("multer");
const router = express.Router();
const {
  getSingleProductImages,
  createImage,
  updateImage,
  deleteImage,
} = require("../controllers/productImages");

// Configure multer storage
const upload = multer({ dest: "../public/" });

// Get all images for a product
router.route("/:id").get(getSingleProductImages);

// Upload one or multiple product images (max 10)
router.route("/").post(upload.array("images", 10), createImage);

// Update a product image
router.route("/:id").put(updateImage);

// Delete a product image
router.route("/:id").delete(deleteImage); // id = imageID

module.exports = router;
