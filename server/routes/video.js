const express = require("express");
const router = express.Router();
const {
  uploadVideo,
  deleteVideo,
  streamVideo,
} = require("../controllers/videoController");

// Загрузка видео
router.post("/upload", uploadVideo);

// Удаление видео
router.delete("/:filename", deleteVideo);

// Стриминг видео
router.get("/stream/:filename", streamVideo);

module.exports = router;