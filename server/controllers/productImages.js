const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Контроллер для работы с изображениями товаров (только JSON-поле)
 */
const productImagesController = {
  /**
   * Добавляет изображения к товару
   * @param {string} productId - ID товара
   * @param {string[]} imageUrls - Массив URL изображений
   * @returns {Promise<Object>} - Результат операции
   */
  async addImagesToProduct(productId, imageUrls) {
    try {
      // Проверяем существование товара
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { images: true },
      });

      if (!product) {
        throw new Error(`Товар с ID ${productId} не найден`);
      }

      // Получаем текущие изображения или создаем пустой массив
      let currentImages = [];
      if (product.images) {
        // Если images уже массив, используем его
        if (Array.isArray(product.images)) {
          currentImages = product.images;
        }
        // Если images строка (JSON), парсим ее
        else if (typeof product.images === "string") {
          try {
            currentImages = JSON.parse(product.images);
            if (!Array.isArray(currentImages)) {
              currentImages = [];
            }
          } catch (e) {
            currentImages = [];
          }
        }
      }

      // Добавляем новые URL к существующим
      const updatedImages = [...currentImages, ...imageUrls];

      // Обновляем запись в БД
      await prisma.product.update({
        where: { id: productId },
        data: { images: updatedImages },
      });

      return {
        success: true,
        message: "Изображения успешно добавлены",
        images: updatedImages,
      };
    } catch (error) {
      console.error("Ошибка при добавлении изображений:", error);
      return {
        success: false,
        message: error.message || "Произошла ошибка при добавлении изображений",
      };
    }
  },

  /**
   * Удаляет изображение из товара
   * @param {string} productId - ID товара
   * @param {string} imageUrl - URL изображения для удаления
   * @returns {Promise<Object>} - Результат операции
   */
  async removeImageFromProduct(productId, imageUrl) {
    try {
      // Проверяем существование товара
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { images: true },
      });

      if (!product) {
        throw new Error(`Товар с ID ${productId} не найден`);
      }

      // Получаем текущие изображения или создаем пустой массив
      let currentImages = [];
      if (product.images) {
        // Если images уже массив, используем его
        if (Array.isArray(product.images)) {
          currentImages = product.images;
        }
        // Если images строка (JSON), парсим ее
        else if (typeof product.images === "string") {
          try {
            currentImages = JSON.parse(product.images);
            if (!Array.isArray(currentImages)) {
              currentImages = [];
            }
          } catch (e) {
            currentImages = [];
          }
        }
      }

      // Удаляем указан��ое изображение
      const updatedImages = currentImages.filter((url) => url !== imageUrl);

      // Обновляем запись в БД
      await prisma.product.update({
        where: { id: productId },
        data: { images: updatedImages },
      });

      return {
        success: true,
        message: "Изображение успешно удалено",
        images: updatedImages,
      };
    } catch (error) {
      console.error("Ошибка при удалении изображения:", error);
      return {
        success: false,
        message: error.message || "Произошла ошибка при удалении изображения",
      };
    }
  },

  /**
   * Получает все изображения товара
   * @param {string} productId - ID товара
   * @returns {Promise<Object>} - Результат операции с массивом URL
   */
  async getProductImages(productId) {
    try {
      // Проверяем существование товара
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { images: true },
      });

      if (!product) {
        throw new Error(`Товар с ID ${productId} не найден`);
      }

      // Получаем изображения или возвращаем пустой массив
      let images = [];
      if (product.images) {
        // Если images уже массив, используем его
        if (Array.isArray(product.images)) {
          images = product.images;
        }
        // Если images строка (JSON), парсим ее
        else if (typeof product.images === "string") {
          try {
            images = JSON.parse(product.images);
            if (!Array.isArray(images)) {
              images = [];
            }
          } catch (e) {
            images = [];
          }
        }
      }

      return {
        success: true,
        images,
      };
    } catch (error) {
      console.error("Ошибка при получении изображений:", error);
      return {
        success: false,
        message: error.message || "Произошла ошибка при получении изображений",
        images: [],
      };
    }
  },

  /**
   * Устанавливает новый набор изображений для товара (заменяет существующие)
   * @param {string} productId - ID товара
   * @param {string[]} imageUrls - Массив URL изображений
   * @returns {Promise<Object>} - Результат операции
   */
  async setProductImages(productId, imageUrls) {
    try {
      // Проверяем существование товара
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error(`Товар с ID ${productId} не найден`);
      }

      // Обновляем запись в БД, заменяя все изображения
      await prisma.product.update({
        where: { id: productId },
        data: { images: imageUrls },
      });

      return {
        success: true,
        message: "Изображения успешно обновлены",
        images: imageUrls,
      };
    } catch (error) {
      console.error("Ошибка при обновлении изображений:", error);
      return {
        success: false,
        message: error.message || "Произошла ошибка при обновлении изображений",
      };
    }
  },

  /**
   * Устанавливает главное изображение товара
   * @param {string} productId - ID товара
   * @param {string} imageUrl - URL изображения
   * @returns {Promise<Object>} - Результат операции
   */
  async setMainImage(productId, imageUrl) {
    try {
      // Проверяем существование товара
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error(`Товар с ID ${productId} не найден`);
      }

      // Обновляем mainImage товара
      await prisma.product.update({
        where: { id: productId },
        data: { mainImage: imageUrl },
      });

      return {
        success: true,
        message: "Главное изображение успешно обновлено",
        mainImage: imageUrl,
      };
    } catch (error) {
      console.error("Ошибка при обновлении главного изображения:", error);
      return {
        success: false,
        message:
          error.message ||
          "Произошла ошибка при обновлении главного изображения",
      };
    }
  },
};

module.exports = productImagesController;
