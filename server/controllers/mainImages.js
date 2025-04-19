const path = require("path");
require("@prisma/client");
const fs = require("fs");

async function uploadMainImage(req, res) {
  try {
    console.log("[DEBUG] Received upload request");

    if (!req.files || Object.keys(req.files).length === 0) {
      console.log("[DEBUG] No files found in request");
      return res.status(400).json({ message: "Nema otpremljenih fajlova" });
    }

    // Get file from a request
    const uploadedFile = req.files.uploadedFile;
    console.log("[DEBUG] Uploaded file info:", {
      name: uploadedFile.name,
      mimetype: uploadedFile.mimetype,
      size: uploadedFile.size,
    });

    // Validate file type and size
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (
      !allowedTypes.includes(uploadedFile.mimetype) ||
      uploadedFile.size > maxSize
    ) {
      console.log("[DEBUG] File validation failed", {
        mimetype: uploadedFile.mimetype,
        size: uploadedFile.size,
      });
      return res.status(400).json({
        message: "Neispravan tip fajla ili veličina fajla je prevelika",
      });
    }

    // Sanitize file name (allow Unicode, but replace dangerous chars)
    const safeFileName = path
      .basename(uploadedFile.name)
      .replace(/[^a-zA-Z0-9а-яА-ЯёЁіІїЇєЄ.\-_]/gu, "_");
    const uploadDir = path.join(__dirname, "../../public");
    const uploadPath = path.join(uploadDir, safeFileName);
    const publicPath = `../public/${encodeURIComponent(safeFileName)}`;

    console.log("[DEBUG] Safe file name:", safeFileName);
    console.log("[DEBUG] Upload directory:", uploadDir);
    console.log("[DEBUG] Upload path:", uploadPath);
    console.log("[DEBUG] Public path:", publicPath);

    // Ensure the public directory exists
    if (!fs.existsSync(uploadDir)) {
      console.log("[DEBUG] Upload directory does not exist, creating...");
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Move file to the directory on the server
    console.log("[DEBUG] Moving file to upload directory...");
    await uploadedFile.mv(uploadPath);
    console.log("[DEBUG] File moved successfully");

    // // Save file metadata to the database (store public path)
    // console.log("[DEBUG] Saving file metadata to database...");
    // await prisma.file.create({
    //   data: {
    //     filename: safeFileName,
    //     path: publicPath, // Store public URL path
    //     mimetype: uploadedFile.mimetype,
    //     size: uploadedFile.size,
    //   },
    // });
    // console.log("[DEBUG] File metadata saved to database");

    res
      .status(200)
      .json({ message: "Fajl je uspešno otpremljen", url: publicPath });
  } catch (err) {
    console.error("Upload error:", err);
    res
      .status(500)
      .json({ message: "Greška pri otpremanju fajla", error: err.message });
  }
}

module.exports = {
  uploadMainImage,
};
