import "dotenv/config";  // ← this way dotenv loads as part of imports

import { app }      from "./src/app.js";
import connectDB    from "./src/config/db.js";

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ VendorHub server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });