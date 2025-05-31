const express = require("express");
const path = require("path");
const productsRouter = require("./routes/products");
const productImagesRouter = require("./routes/productImages");
const categoryRouter = require("./routes/category");
const searchRouter = require("./routes/search");
const mainImageRouter = require("./routes/mainImages");
const userRouter = require("./routes/users");
const orderRouter = require("./routes/customer_orders");
const slugRouter = require("./routes/slugs");
const orderProductRouter = require("./routes/customer_order_product");
const wishlistRouter = require("./routes/wishlist");
const faqArticlesRouter = require("./routes/faqArticles");
const videoRoutes = require("./routes/video");

var cors = require("cors");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
//app.use(fileUpload());

// Serve static files from uploads directory
app.use(express.static(path.join(__dirname, "../uploads")));

app.use("/api/products", productsRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/images", productImagesRouter);
app.use("/api/main-image", mainImageRouter);
app.use("/api/users", userRouter);
app.use("/api/search", searchRouter);
app.use("/api/orders", orderRouter);
app.use("/api/order-product", orderProductRouter);
app.use("/api/slugs", slugRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/faq-articles", faqArticlesRouter);
app.use("/api/videos", videoRoutes);

app.use(
  "/uploads/videos",
  express.static(path.join(__dirname, "uploads/videos"))
);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
