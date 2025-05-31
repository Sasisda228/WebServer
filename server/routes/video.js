const express = require("express");
const router = express.Router();
const { uploadVideo, deleteVideo } = require("../controllers/video");

// Загрузка видео
router.post("/upload", uploadVideo);

// Удаление видео
router.delete("/:filename", deleteVideo);

module.exports = router;
