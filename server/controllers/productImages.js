const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Получить все изображения товара по productID
 */
async function getSingleProductImages(request, response) {
  const { id } = request.params;
  const images = await prisma.image.findMany({
    where: { productID: id },
  });
  if (!images) {
    return response.status(404).json({ error: "Images not found" });
  }
  return response.json(images);
}

/**
 * Загрузить одно или несколько изображений товара (используй multer array('images'))
 */
async function createImage(request, response) {
  try {
    const { productID } = request.body;
    // multer кладет файлы в request.files
    const files = request.files;

    if (!files || files.length === 0) {
      return response.status(400).json({ error: "No files uploaded" });
    }

    const imagesToCreate = files.map((file) => ({
      productID: productID,
      image: file.filename, // или file.path, если нужен полный путь
    }));

    const createdImages = await prisma.image.createMany({
      data: imagesToCreate,
    });

    return response.status(201).json({
      message: "Images uploaded",
      count: createdImages.count,
    });
  } catch (error) {
    console.error("Error creating image:", error);
    return response.status(500).json({ error: "Error creating image" });
  }
}

async function updateImage(request, response) {
  try {
    const { id } = request.params; // Getting product id from params
    const { productID, image } = request.body;

    // Checking whether photo exists for the given product id
    const existingImage = await prisma.image.findFirst({
      where: {
        productID: id, // Finding photo with a product id
      },
    });

    // if photo doesn't exist, return coresponding status code
    if (!existingImage) {
      return response
        .status(404)
        .json({ error: "Image not found for the provided productID" });
    }

    // Updating photo using coresponding imageID
    const updatedImage = await prisma.image.update({
      where: {
        imageID: existingImage.imageID, // Using imageID of the found existing image
      },
      data: {
        productID: productID,
        image: image,
      },
    });

    return response.json(updatedImage);
  } catch (error) {
    console.error("Error updating image:", error);
    return response.status(500).json({ error: "Error updating image" });
  }
}

async function deleteImage(request, response) {
  try {
    const { id } = request.params; // id = imageID
    await prisma.image.delete({
      where: { imageID: id },
    });
    return response.status(204).send();
  } catch (error) {
    console.error("Error deleting image:", error);
    return response.status(500).json({ error: "Error deleting image" });
  }
}

module.exports = {
  getSingleProductImages,
  createImage,
  updateImage,
  deleteImage,
};
