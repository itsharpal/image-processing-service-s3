import { uploadToS3, getFromS3, deleteFromS3 } from "../utils/s3.js";
import sharp from 'sharp'
import { Image } from '../models/image.model.js';

export const uploadImage = async (req, res) => {
    try {
        const { file } = req;
        const userId = req.userId;

        if (!file || !userId) {
            return res.status(400).json({ message: "File and userId are required" });
        }

        const imageUrl = await uploadToS3(file);
        const image = await Image.create({
            url: imageUrl,
            userId
        })

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
