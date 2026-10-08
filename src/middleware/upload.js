const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
    region: process.env.AWS_REGION
});

const storage = multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,

    key: (req, file, cb) => {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, `products/${uniqueName}`);
    }
});

const upload = multer({
    storage: storage,

    limits: {
        files: 5,
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;

        const extension = allowedTypes.test(
            path.extname(file.originalname).toLowerCase()
        );

        const mimeType = allowedTypes.test(file.mimetype);

        if (extension && mimeType) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only JPEG, JPG, PNG and WEBP images are allowed"
                )
            );
        }
    }
});

module.exports = upload;