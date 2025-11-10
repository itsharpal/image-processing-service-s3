import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({});

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
})

export const uploadToS3 = async (file) => {
    const fileStream = fs.createReadStream(file.path);

    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        key: file.filename,
        body: fileStream,
        ContentType: file.mimeType
    }

    try {
        const command = new PutObjectCommand(uploadParams);
        const data = await s3Client.send(command)
        console.log("File uploaded successfully", data)

        return {
            message: "File uploaded successfully",
            url: `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.filename}`,
        }
    } catch (error) {
        console.error("Error uploading file", error)
        return null
    }
}

export const getFromS3 = async (key) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        key: key
    }

    try {
        const command = new GetObjectCommand(params);
        const data = await s3Client.send(command);
        console.log("File downloaded successfully", data)

        return { message: "File downloaded successfully", data }
    } catch (error) {
        console.error("Error downloading file", error)
        return null
    }
}

export const deleteFromS3 = async (key) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        key: key
    }

    try {
        const command = new DeleteObjectCommand(params);
        const data = await s3Client.send(command);
        console.log("File deleted successfully", data)

        return { message: "File deleted successfully", data }
    } catch (error) {
        console.error("Error deleting file", error)
        return null
    }
}