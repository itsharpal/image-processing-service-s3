# Image Processing Service (AWS S3 + Redis + MongoDB)

A simple Node.js/Express backend that lets users sign up, log in, upload images to AWS S3, transform them (resize, rotate, flip, grayscale, format) using Sharp, cache transformed results in Redis, and list/delete their images from MongoDB.

## 🚀 Features
- User authentication (JWT + HttpOnly cookies)
- Image upload to AWS S3 (via Multer and AWS SDK v3)
- On-the-fly image transformations with Sharp
- Caching transformed image URLs in Redis
- List user images with pagination
- Stream original images directly from S3
- Secure environment-based configuration
- Basic rate limiting (Express Rate Limit)

## 🧱 Tech Stack
- Node.js / Express 5
- MongoDB + Mongoose
- AWS S3 (@aws-sdk/client-s3)
- Redis (for caching)
- Sharp (image processing)
- Multer (file uploads)
- JWT (auth)
- dotenv (env management)

## 📂 Project Structure
```
backend/
├── index.js               # App entry + middleware + routes
├── package.json
├── configs/redis.js       # Redis client config
├── controllers/           # Route handlers
│   ├── user.controller.js
│   └── image.controller.js
├── middleware/isAuthenticated.js  # Auth guard
├── models/                # Mongoose models
│   ├── user.model.js
│   └── image.model.js
├── routes/                # API route definitions
│   ├── user.route.js
│   └── image.route.js
├── utils/                 # Helpers (DB + S3)
│   ├── db.js
│   └── s3.js
├── uploads/               # Temp local upload storage (Multer)
└── README.md
```

## 🛠 Prerequisites
Make sure you have:
- Node.js 18+
- MongoDB instance (Atlas or local)
- Redis instance
- AWS S3 bucket + IAM credentials

## 🔐 Environment Variables
Create a `.env` file in `backend/` with:
```
PORT=3000
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=jwt_secret_key
AWS_REGION=your_region
AWS_BUCKET_NAME=your_bucket_name
AWS_ACCESS_KEY=your_access_key_id
AWS_SECRET_KEY=your_secret_access_key
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=optional_if_set
```

## ▶️ Running Locally
Install deps and start in dev mode:
```
npm install
npm run dev
```
Server runs on: `http://localhost:3000`

## 🔑 Auth Flow
1. `POST /api/user/signup` → create account
2. `POST /api/user/login` → sets `token` cookie
3. Include cookie in subsequent requests to protected endpoints.
4. `GET /api/user/logout` → clears cookie

## 📸 Image Endpoints (All require auth unless noted)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/image/upload | Upload an image (form-data: image) |
| GET | /api/image/ | List images (query: page, limit) |
| GET | /api/image/:id | Stream original image |
| POST | /api/image/:id/transform | Apply transformations + cache |
| DELETE | /api/image/:id | Delete image record + S3 object |

### 🔄 Transformations Payload
`POST /api/image/:id/transform`
```json
{
  "transformations": {
    "resize": { "width": 800, "height": 600 },
    "rotate": 90,
    "flip": true,
    "flop": true,
    "grayscale": true,
    "format": "png"
  }
}
```
Only include the operations you need.

## 🧪 Example Upload (cURL)
```
curl -X POST http://localhost:3000/api/image/upload \
  -b "token=YOUR_JWT" \
  -F image=@/path/to/file.jpg
```

## 🗄 Data Model Summary
### User
```json
{
  "name": "string",
  "email": "string",
  "password": "hashed string"
}
```
### Image
```json
{
  "url": "string (S3 public URL)",
  "userId": "ObjectId",
  "metadata": {}
}
```

## 🧠 Caching
Transformed image URLs are cached in Redis for 1 hour (`EX: 3600`). Subsequent transformations for the same image ID will return cached result if present.

## 🚨 Rate Limiting
Configured globally: max 20 requests per 15 minutes per IP. Adjust in `index.js`.

## ❗️ Notes & Gotchas
- `deleteImage` currently calls `deleteFromS3(id)` but S3 key is usually the filename (extracted from URL). Adjust logic if needed.
- Ensure S3 bucket policy allows public read or use signed URLs.
- Multer stores temp files in `uploads/` before S3 upload.
- For production, secure cookies (add `secure: true` over HTTPS).

## 🧩 Future Improvements
- Add tests (Jest / Supertest)
- Add refresh tokens / password reset
- Support more image formats & metadata
- Add Swagger/OpenAPI docs
- Add background workers via RabbitMQ (already dependency)

## 🆘 Troubleshooting
| Issue | Fix |
|-------|-----|
| Mongo not connecting | Check `MONGO_URI` and network access (Atlas IP whitelist). |
| Redis auth error | Ensure password matches or remove if not set. |
| 403 S3 access | Verify IAM permissions: s3:PutObject, GetObject, DeleteObject. |
| Images not streaming | Check bucket CORS + ensure correct key from URL. |
| Invalid token | Ensure `SECRET_KEY` matches server env. |

## 📄 License
ISC

---
Made with Node.js, AWS, and ☕️.
