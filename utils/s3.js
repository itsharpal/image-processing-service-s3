import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    },
});

// ✅ Upload to S3
export const uploadToS3 = async (file) => {
    if (!file) throw new Error("No file provided for upload.");

    const fileStream = fs.createReadStream(file.path);

    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: file.filename || file.originalname || `image-${Date.now()}`,
        Body: fileStream,
        ContentType: file.mimetype,
    };

    try {
        const command = new PutObjectCommand(uploadParams);
        const data = await s3Client.send(command);
        console.log("✅ File uploaded successfully:", data);

        return {
            message: "File uploaded successfully",
            url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`,
        };
    } catch (error) {
        console.error("❌ Error uploading file:", error);
        return null;
    }
};

// ✅ Get from S3
export const getFromS3 = async (key) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    };

    try {
        const command = new GetObjectCommand(params);
        const data = await s3Client.send(command);
        console.log("✅ File retrieved successfully");
        return { message: "File retrieved successfully", data };
    } catch (error) {
        console.error("❌ Error retrieving file:", error);
        return null;
    }
};

// ✅ Delete from S3
export const deleteFromS3 = async (key) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    };

    try {
        const command = new DeleteObjectCommand(params);
        const data = await s3Client.send(command);
        console.log("🗑️ File deleted successfully");
        return { message: "File deleted successfully", data };
    } catch (error) {
        console.error("❌ Error deleting file:", error);
        return null;
    }
};