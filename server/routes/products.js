const express = require("express");

const router = express.Router();
const {
  getAllProducts,
  createProduct,
  updateProduct,
  changePositionProduct,
  deleteProduct,
  getProductById,
} = require("../controllers/products");

router.route("/").get(getAllProducts).post(createProduct);
router.route("/updatePosition/:id").post(changePositionProduct);
router
  .route("/:id")
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;
