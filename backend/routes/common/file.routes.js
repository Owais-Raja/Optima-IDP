const express = require("express");
const router = express.Router();
const fileController = require("../../controllers/file.controller");

// Get file by filename
router.get("/:filename", fileController.getFile);

module.exports = router;
