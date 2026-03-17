import "dotenv/config";
import express          from "express";
import cors             from "cors";
import morgan           from "morgan";
import { swaggerSpec }  from "./config/swagger.js";
import connectDB        from "./config/db.js";

connectDB().catch(console.error);

const app = express();

// ─── Core Middleware ───────────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(morgan("dev"));

// ─── Swagger Docs via CDN (works on Vercel) ───────────────────────
app.get("/api/docs", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>VendorHub API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>
    body { margin: 0; }
    .swagger-ui .topbar { background-color: #1a1a2e; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = () => {
      SwaggerUIBundle({
        url:            "/api/docs/json",
        dom_id:         "#swagger-ui",
        presets:        [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout:         "StandaloneLayout",
        deepLinking:    true,
        displayRequestDuration: true,
      });
    };
  </script>
</body>
</html>`);
});

// ─── Swagger JSON spec endpoint ───────────────────────────────────
app.get("/api/docs/json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(swaggerSpec);
});

// ─── Routes ───────────────────────────────────────────────────────
import authRoutes    from "./routes/auth.routes.js";
import userRoutes    from "./routes/user.routes.js";
import vendorRoutes  from "./routes/vendor.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes    from "./routes/cart.routes.js";
import orderRoutes   from "./routes/order.routes.js";
import reviewRoutes  from "./routes/review.routes.js";
import couponRoutes  from "./routes/coupon.routes.js";
import adminRoutes   from "./routes/admin.routes.js";

app.use("/api/v1/auth",     authRoutes);
app.use("/api/v1/users",    userRoutes);
app.use("/api/v1/vendors",  vendorRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart",     cartRoutes);
app.use("/api/v1/orders",   orderRoutes);
app.use("/api/v1/reviews",  reviewRoutes);
app.use("/api/v1/coupons",  couponRoutes);
app.use("/api/v1/admin",    adminRoutes);

// ─── Health Check ─────────────────────────────────────────────────
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ success: true, message: "VendorHub API is running 🚀" });
});

// ─── Global Error Handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success:  false,
    message:  err.message || "Internal Server Error",
    errors:   err.errors  || [],
    stack:    process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export { app };
export default app;