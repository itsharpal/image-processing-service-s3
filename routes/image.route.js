import express from 'express';
import { getImage, transformImage, uploadImage } from '../controllers/image.controller.js';
import { upload } from '../middleware/multer.js';
import isAuthenticated from '../middleware/isAuthenticated.js';

const router = express.Router();

router.route('/upload').post(isAuthenticated, upload.single("image"), uploadImage);
router.get("/", isAuthenticated, getImage);
router.post("/:id/transform", isAuthenticated, transformImage);

export default router;