const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./config/db");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");
const logger = require("./config/logger");

const app = express();

/**
 * SECURITY MIDDLEWARE
 * ----------------------------------------------------
 * Helmet: Sets various HTTP headers to secure the app.
 * RateLimit: Prevents brute-force attacks by limiting requests.
 */
app.use(helmet());

// Rate Limiting Configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all API routes
app.use("/api/", limiter);

/**
 * LOGGING MIDDLEWARE
 * ----------------------------------------------------
 * Morgan: HTTP request logger.
 * Connects to Winston stream to save logs to file.
 */
app.use(morgan("combined", { stream: logger.stream }));

const path = require("path"); // Add path import

// Standard Middlewares
app.use(cors());
app.use(express.json());
// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Request logging middleware (Custom)
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

/**
 * ROUTES
 * ----------------------------------------------------
 * Define all API routes here.
 */
app.use("/api/auth", require("./routes/common/auth.routes"));
app.use("/api/user", require("./routes/common/user.routes"));
app.use("/api/skill", require("./routes/common/skill.routes"));
app.use("/api/resource", require("./routes/common/resource.routes"));
app.use("/api/idp", require("./routes/emp/idp.routes"));
app.use("/api/performance", require("./routes/emp/performance.routes"));
app.use("/api/emp-dashboard", require("./routes/emp/dashboard.routes"));
app.use("/api/recommender", require("./routes/common/recommender.routes"));
app.use("/api/recommend", require("./routes/common/recommend.routes"));
app.use("/api/admin", require("./routes/admin/admin.routes"));
app.use("/api/manager", require("./routes/manager/manager.routes"));
app.use("/api/announcements", require("./routes/common/announcement.routes")); // Note: Check if this was common or admin in moves. Based on file listing it is in common.



// Root welcome route
app.get("/", (req, res) => {
  res.json({
    message: "Optima IDP backend is running...",
    status: "healthy",
    timestamp: new Date().toISOString(),
    docs: "/api-docs"
  });
});

// Lightweight health check for uptime monitoring
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.path}`);
  res.status(404).json({
    message: "Route not found",
    path: req.path
  });
});

// Error handling middleware (must be last)
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM signal received: closing HTTP server");
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("SIGINT signal received: closing HTTP server");
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();