const cloudinary = require('../config/cloudinary');

const createFeed = async (req, res) => {
  try {
    const ref = req.get("referer");
    const parsed = new URL(ref || "http://unknown-site.com");
    const origin = parsed.origin;
    const pathname = parsed.pathname;
    console.log("🛰️ Feedback came from:", origin, pathname);

    if (!req.file) {
      return res.status(400).json({ msg: "No image file provided" });
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: "feedback_images" },
      (error, result) => {
        if (error) {
          console.error("❌ Cloudinary error:", error);
          return res.status(500).json({ error });
        }
        return res.status(200).json({ url: result.secure_url });
      }
    );

    stream.end(req.file.buffer); // ✅ Push the file to Cloudinary

  } catch (err) {
    console.error("❌ Upload failed:", err.message);
    return res.status(500).json({ msg: "Upload failed", error: err.message });
  }
};

module.exports = { createFeed };
