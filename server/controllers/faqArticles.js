const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Получить все статьи FAQ
async function getAllFaqArticles(request, response) {
  try {
    const articles = await prisma.faqArticle.findMany({
      orderBy: {
        id: "asc", // Или другая сортировка, например, по createdAt
      },
    });
    return response.status(200).json(articles);
  } catch (error) {
    console.error("Error fetching FAQ articles:", error);
    return response.status(500).json({ error: "Error fetching FAQ articles" });
  }
  // Prisma Client не требует явного $disconnect в долгоживущих приложениях Express
}

// Создать новую статью FAQ
async function createFaqArticle(request, response) {
  try {
    const { title, content, gradient } = request.body;

    // Простая валидация
    if (!title || !content) {
      return response
        .status(400)
        .json({ error: "Title and content are required" });
    }

    const newArticle = await prisma.faqArticle.create({
      data: {
        title,
        content,
        gradient, // Может быть null или undefined, если не передан
      },
    });
    return response.status(201).json(newArticle);
  } catch (error) {
    console.error("Error creating FAQ article:", error);
    return response.status(500).json({ error: "Error creating FAQ article" });
  }
}

// Обновить статью FAQ
async function updateFaqArticle(request, response) {
  try {
    const { id } = request.params;
    const { title, content, gradient } = request.body;

    // Проверка существования статьи
    const existingArticle = await prisma.faqArticle.findUnique({
      where: { id: parseInt(id) }, // Убедимся, что id - число
    });

    if (!existingArticle) {
      return response.status(404).json({ error: "FAQ Article not found" });
    }

    // Простая валидация
    if (!title || !content) {
      return response
        .status(400)
        .json({ error: "Title and content are required" });
    }

    const updatedArticle = await prisma.faqArticle.update({
      where: { id: parseInt(id) },
      data: {
        title,
        content,
        gradient,
      },
    });
    return response.status(200).json(updatedArticle);
  } catch (error) {
    console.error("Error updating FAQ article:", error);
    return response.status(500).json({ error: "Error updating FAQ article" });
  }
}

// Удалить статью FAQ
async function deleteFaqArticle(request, response) {
  try {
    const { id } = request.params;

    // Проверка существования статьи перед удалением
    const existingArticle = await prisma.faqArticle.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingArticle) {
      return response.status(404).json({ error: "FAQ Article not found" });
    }

    await prisma.faqArticle.delete({
      where: { id: parseInt(id) },
    });
    // Отправляем статус 204 No Content после успешного удаления
    return response.status(204).send();
  } catch (error) {
    console.error("Error deleting FAQ article:", error);
    // Обработка ошибки, если статья связана с другими данными (foreign key constraint)
    if (error.code === "P2003") {
      // Код ошибки Prisma для foreign key constraint
      return response
        .status(409)
        .json({
          error: "Cannot delete article because it is referenced elsewhere.",
        });
    }
    return response.status(500).json({ error: "Error deleting FAQ article" });
  }
}

module.exports = {
  getAllFaqArticles,
  createFaqArticle,
  updateFaqArticle,
  deleteFaqArticle,
};
