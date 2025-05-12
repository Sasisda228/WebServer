const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getAllProducts(request, response) {
  const { mode, category } = request.query;

  // Admin mode - return all products without filtering or pagination
  if (mode === "admin") {
    try {
      const adminProducts = await prisma.product.findMany({});
      return response.json(adminProducts);
    } catch (error) {
      return response.status(500).json({ error: "Error fetching products" });
    }
  }

  try {
    // Build query parameters
    const queryOptions = {
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    };

    // Add category filter if provided
    if (category) {
      queryOptions.where = {
        category: {
          name: {
            equals: category,
          },
        },
      };
    }

    // Add sorting
    // Default to position sorting as requested
    queryOptions.orderBy = { position: "asc" };

    const products = await prisma.product.findMany(queryOptions);
    return response.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return response.status(500).json({ error: "Error fetching products" });
  }
}
async function createProduct(request, response) {
  try {
    const {
      slug,
      title,
      price,
      description,
      manufacturer,
      categoryId,
      inStock,
      images,
    } = request.body;
    const product = await prisma.product.create({
      data: {
        slug,
        title,
        price,
        rating: 5,
        description,
        manufacturer,
        categoryId,
        inStock,
        images,
      },
    });
    return response.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error); // Dodajemo log za proveru
    return response.status(500).json({ error: "Error creating product" });
  }
}
async function changePositionProduct(request, response) {
  try {
    const { id } = request.params;
    const { position } = request.body;
    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });
    if (!existingProduct) {
      return response.status(404).json({ error: "Product not found" });
    }
    const updatedProduct = await prisma.product.update({
      where: {
        id,
      },
      data: {
        position: position,
      },
    });
    return response.status(200).json(updatedProduct);
  } catch (error) {
    return response.status(500).json({ error: "Error updating product" });
  }
}
// Method for updating existing product
async function updateProduct(request, response) {
  try {
    const { id } = request.params; // Getting a slug from params
    const {
      slug,
      title,
      images,
      price,
      rating,
      description,
      manufacturer,
      categoryId,
      inStock,
    } = request.body;
    // Finding a product by slug
    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return response.status(404).json({ error: "Product not found" });
    }

    // Updating found product
    const updatedProduct = await prisma.product.update({
      where: {
        id, // Using id of the found product
      },
      data: {
        title: title,
        images: images,
        slug: slug,
        price: price,
        rating: rating,
        description: description,
        manufacturer: manufacturer,
        categoryId: categoryId,
        inStock: inStock,
      },
    });

    return response.status(200).json(updatedProduct);
  } catch (error) {
    return response.status(500).json({ error: "Error updating product" });
  }
}

// Method for deleting a product
async function deleteProduct(request, response) {
  try {
    const { id } = request.params;

    // Check for related records in wishlist table
    const relatedOrderProductItems =
      await prisma.customer_order_product.findMany({
        where: {
          productId: id,
        },
      });
    if (relatedOrderProductItems.length > 0) {
      return response.status(400).json({
        error: "Cannot delete product because of foreign key constraint. ",
      });
    }

    await prisma.product.delete({
      where: {
        id,
      },
    });
    return response.status(204).send();
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: "Error deleting product" });
  }
}

async function searchProducts(request, response) {
  try {
    const { query } = request.query;
    if (!query) {
      return response
        .status(400)
        .json({ error: "Query parameter is required" });
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
            },
          },
          {
            description: {
              contains: query,
            },
          },
        ],
      },
    });

    return response.json(products);
  } catch (error) {
    console.error("Error searching products:", error);
    return response.status(500).json({ error: "Error searching products" });
  }
}

async function getProductById(request, response) {
  const { id } = request.params;
  const product = await prisma.product.findUnique({
    where: {
      id: id,
    },
    include: {
      category: true,
    },
  });
  if (!product) {
    return response.status(404).json({ error: "Product not found" });
  }
  return response.status(200).json(product);
}

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  changePositionProduct,
  getProductById,
};
