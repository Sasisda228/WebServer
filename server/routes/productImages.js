const express = require("express");
const router = express.Router();
const productImagesController = require("../controllers/productImages");

/**
 * @route POST /api/products/:productId/images
 * @desc Добавляет изображения к товару
 * @access Private
 */
router.post("/:productId/images", async (req, res) => {
  try {
    const { productId } = req.params;
    const { imageUrls } = req.body;

    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Необходимо предоставить массив URL изображений",
      });
    }

    const result = await productImagesController.addImagesToProduct(
      parseInt(productId, 10),
      imageUrls
    );

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Ошибка в маршруте добавления изображений:", error);
    return res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера",
    });
  }
});

/**
 * @route DELETE /api/products/:productId/images
 * @desc Удаляет изображение из товара
 * @access Private
 */
router.delete("/:productId/images", async (req, res) => {
  try {
    const { productId } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Необходимо предоставить URL изображения для удаления",
      });
    }

    const result = await productImagesController.removeImageFromProduct(
      parseInt(productId, 10),
      imageUrl
    );

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Ошибка в маршруте удаления изображения:", error);
    return res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера",
    });
  }
});

/**
 * @route GET /api/products/:productId/images
 * @desc Получает все изображения товара
 * @access Public
 */
router.get("/:productId/images", async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await productImagesController.getProductImages(
      parseInt(productId, 10)
    );

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error("Ошибка в маршруте получения изображений:", error);
    return res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера",
      images: [],
    });
  }
});

/**
 * @route PUT /api/products/:productId/images
 * @desc Устанавливает новый набор изображений для товара (заменяет существующие)
 * @access Private
 */
router.put("/:productId/images", async (req, res) => {
  try {
    const { productId } = req.params;
    const { imageUrls } = req.body;

    if (!Array.isArray(imageUrls)) {
      return res.status(400).json({
        success: false,
        message: "Необходимо предоставить массив URL изображений",
      });
    }

    const result = await productImagesController.setProductImages(
      parseInt(productId, 10),
      imageUrls
    );

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Ошибка в маршруте обновления изображений:", error);
    return res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера",
    });
  }
});

module.exports = router;
