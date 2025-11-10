import { uploadToS3, getFromS3, deleteFromS3 } from "../utils/s3.js";
import sharp from 'sharp'
import { Image } from '../models/image.model.js';
import redisClient from "../configs/redis.js";

export const uploadImage = async (req, res) => {
    try {
        const { file } = req;
        const userId = req.userId;

        if (!file || !userId) {
            return res.status(400).json({ message: "File and userId are required" });
        }

        const imageUrl = await uploadToS3(file);
        const image = new Image({ url: imageUrl.url, userId });
        await image.save();

        res.status(201).json({
            success: true,
            message: "Image uploaded successfully",
            imageUrl,
        });
    } catch (error) {
        console.error("❌ Upload Error:", error);
        res.status(500).json({
            success: false,
            message: "Error uploading image",
            error: error.message,
        });
    }
};

export const transformImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { transformations } = req.body;

        if (!id || !transformations) {
            return res
                .status(400)
                .json({ message: "Image ID and transformations are required" });
        }

        // ✅ FIXED: Redis v4 uses .get() instead of .getAsync()
        const cachedImage = await redisClient.get(id);
        if (cachedImage) {
            console.log("✅ Cache hit for image:", id);
            return res.status(200).json({
                success: true,
                message: "Image fetched from cache",
                imageUrl: JSON.parse(cachedImage),
            });
        }

        const image = await Image.findById(id);
        if (!image) {
            return res.status(404).json({ message: "Image not found" });
        }

        const s3Key = image.url.split('/').pop();

        const s3Object = await getFromS3(s3Key);
        if (!s3Object || !s3Object.data) {
            return res.status(404).json({ message: "Image not found on S3" });
        }

        // Transform the image buffer using Sharp
        let sharpInstance = sharp(await s3Object.data.Body.transformToByteArray());

        if (transformations.resize) {
            sharpInstance = sharpInstance.resize(transformations.resize);
        }
        if (transformations.rotate) {
            sharpInstance = sharpInstance.rotate(transformations.rotate);
        }
        if (transformations.flip) sharpInstance = sharpInstance.flip();
        if (transformations.flop) sharpInstance = sharpInstance.flop();
        if (transformations.grayscale) sharpInstance = sharpInstance.grayscale();
        if (transformations.format)
            sharpInstance = sharpInstance.toFormat(transformations.format);

        const transformedBuffer = await sharpInstance.toBuffer();

        const transformedImageUrl = await uploadToS3({
            path: null,
            filename: `transformed-${Date.now()}-${id}.jpg`,
            mimetype: "image/jpeg",
            buffer: transformedBuffer,
        });

        // ✅ FIXED: Redis v4 .set() syntax
        await redisClient.set(id, JSON.stringify(transformedImageUrl), {
            EX: 3600, // cache expires in 1 hour
        });

        res.status(200).json({
            success: true,
            message: "Image transformed successfully",
            imageUrl: transformedImageUrl,
        });
    } catch (error) {
        console.error("❌ Transformation Error:", error);
        res.status(500).json({
            success: false,
            message: "Error transforming image",
            error: error.message,
        });
    }
};

export const getImage = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "Image ID is required" });

        // 1️⃣ Find the image document in MongoDB
        const imageDoc = await Image.findById(id);
        if (!imageDoc) {
            return res.status(404).json({ message: "Image not found" });
        }

        // 2️⃣ Extract the S3 key (the filename)
        const s3Key = imageDoc.url.split("/").pop();

        // 3️⃣ Fetch the file stream from S3
        const s3Response = await getFromS3(s3Key);
        if (!s3Response || !s3Response.data) {
            return res.status(404).json({ message: "File not found on S3" });
        }

        // 4️⃣ Set appropriate headers
        res.setHeader("Content-Type", s3Response.data.ContentType || "image/jpeg");

        // 5️⃣ Stream the image data directly to the response
        s3Response.data.Body.pipe(res);

    } catch (error) {
        console.error("❌ Get Image Error:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving image",
            error: error.message,
        });
    }
};

export const deleteImage = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "Image ID is required" });

        await deleteFromS3(id);
        await Image.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Image deleted successfully",
        });
    } catch (error) {
        console.error("❌ Delete Error:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting image",
            error: error.message,
        });
    }
};


export const listImage = async (req, res) => {
    try {
        const { userId } = req;
        const { page = 1, limit = 10 } = req.query;

        if (!userId)
            return res.status(400).json({ message: "User ID is required" });

        const images = await Image.find({ userId }).skip((page - 1) * limit).limit(parseInt(limit));
        res.status(200).json({
            success: true,
            message: "Images listed successfully",
            images,
        });
    } catch (error) {
        console.error("❌ List Error:", error);
        res.status(500).json({
            success: false,
            message: "Error listing images",
            error: error.message,
        });
    }
};
