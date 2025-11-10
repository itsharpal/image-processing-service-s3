import express from 'express';
import multer from 'multer';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { deleteImage, getImage, listImage, transformImage, uploadImage } from '../controllers/image.controller.js';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.route('/:id').get(isAuthenticated, getImage);
router.route('/').get(isAuthenticated, listImage);
router.route('/upload').post(isAuthenticated, upload.single("image"), uploadImage);
router.route('/:id/transform').post(isAuthenticated, transformImage);
router.route('/:id').delete(isAuthenticated, deleteImage);

export default router;