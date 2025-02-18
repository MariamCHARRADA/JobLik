const multer = require("multer");

// disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // null: there is no error
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

//  create multer instance with the specified storage configuration
const upload = multer({ storage: storage });

module.exports = upload;
