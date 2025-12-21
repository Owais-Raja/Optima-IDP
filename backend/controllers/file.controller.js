const mongoose = require("mongoose");
const logger = require("../config/logger");

let gridfsBucket;

const conn = mongoose.connection;
conn.once("open", () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: "uploads"
    });
    logger.info("GridFSBucket initialized");
});

/**
 * GET FILE BY FILENAME
 * ----------------------------------------------------
 * GET /api/files/:filename
 */
exports.getFile = async (req, res) => {
    try {
        if (!gridfsBucket) {
            // In case it's not initialized yet (though it should be by the time a request comes)
            return res.status(500).json({ message: "GridFS not initialized" });
        }

        const file = await conn.db.collection("uploads.files").findOne({ filename: req.params.filename });

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        // Set content type
        if (file.contentType) {
            res.set("Content-Type", file.contentType);
        } else if (file.metadata && file.metadata.mimetype) { // fallback
            res.set("Content-Type", file.metadata.mimetype);
        }

        // Support Range requests (for video streaming)
        // Simple implementation: Stream whole file. Browser handles seeking if Range is supported, 
        // but fully supporting Range headers requires more logic.
        // For now, basic streaming:

        const readStream = gridfsBucket.openDownloadStreamByName(req.params.filename);
        readStream.on("error", (err) => {
            logger.error(`Stream error: ${err}`);
            res.status(500).json({ message: "Error streaming file" });
        });

        readStream.pipe(res);

    } catch (error) {
        logger.error(`Get File Error: ${error}`);
        res.status(500).json({ message: "Server error" });
    }
};
