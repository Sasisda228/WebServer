const express = require("express");
const router = express.Router();

const {
  getAllFaqArticles,
  createFaqArticle,
  updateFaqArticle,
  deleteFaqArticle,
} = require("../controllers/faqArticles"); // Импортируем контроллер

// Маршрут для получения всех статей и создания новой
router.route("/").get(getAllFaqArticles).post(createFaqArticle);

// Маршруты для обновления и удаления конкретной статьи по ID
router.route("/:id").put(updateFaqArticle).delete(deleteFaqArticle);

module.exports = router;
