const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const uploadPath = path.join(__dirname, "../uploads/videos");

    // Создаем директорию если её нет
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (_req, file, cb) {
    // Генерируем уникальное имя файла
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const ext = path.extname(file.originalname);
    const filename = `video-${uniqueSuffix}${ext}`;
    cb(null, filename);
  },
});

// Настройка multer
const upload = multer({
  storage: storage,
  fileFilter: function (_req, file, cb) {
    const allowedTypes = /mp4|mpeg|mov|avi|wmv|webm/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"));
    }
  },
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
}).single("video");

async function uploadVideo(request, response) {
  try {
    upload(request, response, function (err) {
      if (err) {
        return response.status(400).json({ error: err.message });
      }

      if (!request.file) {
        return response.status(400).json({ error: "No video file provided" });
      }

      // Возвращаем только название файла
      return response.status(201).json({ filename: request.file.filename });
    });
  } catch (error) {
    return response.status(500).json({ error: "Error uploading video" });
  }
}

async function deleteVideo(request, response) {
  try {
    const { filename } = request.params;

    if (!filename) {
      return response.status(400).json({ error: "Filename is required" });
    }

    // Защита от path traversal
    if (
      filename.includes("/") ||
      filename.includes("\\") ||
      filename.includes("..")
    ) {
      return response.status(400).json({ error: "Invalid filename" });
    }

    const filePath = path.join(__dirname, "../uploads/videos", filename);

    // Проверяем существование файла
    if (!fs.existsSync(filePath)) {
      return response.status(404).json({ error: "Video file not found" });
    }

    // Удаляем файл
    fs.unlinkSync(filePath);

    return response.status(204).send();
  } catch (error) {
    return response.status(500).json({ error: "Error deleting video" });
  }
}

module.exports = {
  uploadVideo,
  deleteVideo,
};
