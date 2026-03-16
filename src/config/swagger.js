import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title:       "VendorHub API",
      version:     "1.0.0",
      description: "Multi-Vendor E-Commerce Platform — Full API Documentation",
    },
    servers: [
      { url: "http://localhost:8000/api/v1", description: "Local Development" },
      { url: "https://your-app.railway.app/api/v1", description: "Production" },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Paste your accessToken here. Get it from /auth/login response.",
        },
      },
      schemas: {

        // ─── AUTH ────────────────────────────────────────────────
        RegisterCustomer: {
          type: "object",
          required: ["fullName", "email", "password"],
          properties: {
            fullName: { type: "string", example: "John Customer" },
            email:    { type: "string", example: "customer@test.com" },
            password: { type: "string", example: "Test@1234", description: "Min 6 chars, must have uppercase, lowercase and number" },
            role:     { type: "string", enum: ["customer"], example: "customer" },
          },
        },

        RegisterVendor: {
          type: "object",
          required: ["fullName", "email", "password", "role"],
          properties: {
            fullName: { type: "string", example: "Jane Vendor" },
            email:    { type: "string", example: "vendor@test.com" },
            password: { type: "string", example: "Test@1234" },
            role:     { type: "string", enum: ["vendor"], example: "vendor" },
          },
        },

        RegisterAdmin: {
          type: "object",
          required: ["fullName", "email", "password", "role"],
          properties: {
            fullName: { type: "string", example: "Super Admin" },
            email:    { type: "string", example: "admin@test.com" },
            password: { type: "string", example: "Test@1234" },
            role:     { type: "string", enum: ["admin"], example: "admin" },
          },
        },

        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email:    { type: "string", example: "customer@test.com" },
            password: { type: "string", example: "Test@1234" },
          },
        },

        LoginVendor: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email:    { type: "string", example: "vendor@test.com" },
            password: { type: "string", example: "Test@1234" },
          },
        },

        LoginAdmin: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email:    { type: "string", example: "admin@test.com" },
            password: { type: "string", example: "Test@1234" },
          },
        },

        ChangePassword: {
          type: "object",
          required: ["oldPassword", "newPassword"],
          properties: {
            oldPassword: { type: "string", example: "Test@1234" },
            newPassword: { type: "string", example: "NewTest@5678" },
          },
        },

        RefreshToken: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          },
        },

        // ─── VENDOR ──────────────────────────────────────────────
        VendorSetup: {
          type: "object",
          required: ["storeName"],
          properties: {
            storeName:        { type: "string", example: "Tech Haven Store" },
            storeDescription: { type: "string", example: "Best electronics and gadgets at affordable prices" },
            "bankDetails[accountName]":   { type: "string", example: "Jane Vendor" },
            "bankDetails[accountNumber]": { type: "string", example: "1234567890" },
            "bankDetails[bankName]":      { type: "string", example: "HBL Bank" },
            storeLogo:   { type: "string", format: "binary", description: "Store logo image (max 5MB)" },
            storeBanner: { type: "string", format: "binary", description: "Store banner image (max 5MB)" },
          },
        },

        VendorUpdate: {
          type: "object",
          properties: {
            storeName:        { type: "string", example: "Tech Haven Store Updated" },
            storeDescription: { type: "string", example: "Updated description" },
            "bankDetails[accountName]":   { type: "string", example: "Jane Vendor" },
            "bankDetails[accountNumber]": { type: "string", example: "9876543210" },
            "bankDetails[bankName]":      { type: "string", example: "Meezan Bank" },
            storeLogo:   { type: "string", format: "binary" },
            storeBanner: { type: "string", format: "binary" },
          },
        },

        // ─── PRODUCT ─────────────────────────────────────────────
        CreateProduct: {
          type: "object",
          required: ["title", "description", "price", "category"],
          properties: {
            title:         { type: "string", example: "iPhone 15 Pro Max Case" },
            description:   { type: "string", example: "Premium leather case for iPhone 15 Pro Max with card holder and magnetic closure. Provides full protection against drops and scratches." },
            price:         { type: "number", example: 29.99 },
            discountPrice: { type: "number", example: 24.99, description: "Optional sale price. Leave 0 for no discount." },
            category:      { type: "string", example: "accessories", description: "Lowercase category name" },
            stock:         { type: "integer", example: 100 },
            tags:          { type: "string", example: "iphone,case,leather,accessories", description: "Comma separated tags" },
            images:        { type: "array", items: { type: "string", format: "binary" }, description: "Max 5 images, each max 5MB" },
          },
        },

        UpdateProduct: {
          type: "object",
          properties: {
            title:         { type: "string", example: "iPhone 15 Pro Max Premium Case" },
            description:   { type: "string", example: "Updated description" },
            price:         { type: "number", example: 34.99 },
            discountPrice: { type: "number", example: 29.99 },
            category:      { type: "string", example: "accessories" },
            stock:         { type: "integer", example: 150 },
            tags:          { type: "string", example: "iphone,premium,case" },
            isActive:      { type: "boolean", example: true },
          },
        },

        UpdateStock: {
          type: "object",
          required: ["stock"],
          properties: {
            stock: { type: "integer", example: 3, description: "Set to 3 or less to trigger low stock alert" },
          },
        },

        // ─── CART ────────────────────────────────────────────────
        AddToCart: {
          type: "object",
          required: ["productId"],
          properties: {
            productId: { type: "string", example: "64abc123def456ghi789" },
            quantity:  { type: "integer", example: 2, default: 1 },
          },
        },

        UpdateCartItem: {
          type: "object",
          required: ["quantity"],
          properties: {
            quantity: { type: "integer", example: 3, minimum: 1 },
          },
        },

        ApplyCoupon: {
          type: "object",
          required: ["code"],
          properties: {
            code: { type: "string", example: "SAVE20", description: "Coupon code — case insensitive" },
          },
        },

        // ─── ORDER ───────────────────────────────────────────────
        PlaceOrder: {
          type: "object",
          required: ["paymentIntentId", "shippingAddress"],
          properties: {
            paymentIntentId: { type: "string", example: "pi_3abc123def456..." },
            shippingAddress: {
              type: "object",
              required: ["fullName", "phone", "address", "city", "state", "postalCode"],
              properties: {
                fullName:   { type: "string", example: "John Customer" },
                phone:      { type: "string", example: "03001234567" },
                address:    { type: "string", example: "123 Main Street, Block 5" },
                city:       { type: "string", example: "Karachi" },
                state:      { type: "string", example: "Sindh" },
                postalCode: { type: "string", example: "75500" },
                country:    { type: "string", example: "Pakistan" },
              },
            },
          },
        },

        UpdateOrderStatus: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["shipped", "delivered"],
              example: "shipped",
              description: "confirmed→shipped→delivered only. No skipping.",
            },
          },
        },

        // ─── REVIEW ──────────────────────────────────────────────
        CreateReview: {
          type: "object",
          required: ["productId", "orderId", "rating", "comment"],
          properties: {
            productId: { type: "string", example: "64abc123def456ghi789" },
            orderId:   { type: "string", example: "64xyz789abc123def456" },
            rating:    { type: "integer", minimum: 1, maximum: 5, example: 5 },
            comment:   { type: "string", example: "Absolutely amazing product! Great quality and fast shipping. Would definitely buy again.", minLength: 10 },
            images:    { type: "array", items: { type: "string", format: "binary" }, description: "Max 3 review images" },
          },
        },

        UpdateReview: {
          type: "object",
          properties: {
            rating:  { type: "integer", minimum: 1, maximum: 5, example: 4 },
            comment: { type: "string", example: "Great product but delivery was a bit slow. Quality is still top notch." },
          },
        },

        // ─── COUPON ──────────────────────────────────────────────
        CreateCoupon: {
          type: "object",
          required: ["code", "discountType", "discountValue", "expiresAt"],
          properties: {
            code:           { type: "string", example: "SAVE20", description: "Uppercase, unique code" },
            discountType:   { type: "string", enum: ["percentage", "fixed"], example: "percentage" },
            discountValue:  { type: "number", example: 20, description: "20 means 20% off" },
            minOrderAmount: { type: "number", example: 50, description: "Minimum cart total to apply coupon" },
            maxDiscount:    { type: "number", example: 30, description: "Max discount cap for percentage coupons" },
            usageLimit:     { type: "integer", example: 100, description: "How many times this coupon can be used total" },
            expiresAt:      { type: "string", format: "date-time", example: "2025-12-31T23:59:59.000Z" },
          },
        },

        CreateFixedCoupon: {
          type: "object",
          required: ["code", "discountType", "discountValue", "expiresAt"],
          properties: {
            code:           { type: "string", example: "FLAT10" },
            discountType:   { type: "string", enum: ["fixed"], example: "fixed" },
            discountValue:  { type: "number", example: 10, description: "$10 flat off" },
            minOrderAmount: { type: "number", example: 30 },
            usageLimit:     { type: "integer", example: 50 },
            expiresAt:      { type: "string", format: "date-time", example: "2025-12-31T23:59:59.000Z" },
          },
        },

        // ─── COMMON ──────────────────────────────────────────────
        SuccessResponse: {
          type: "object",
          properties: {
            success:    { type: "boolean", example: true },
            statusCode: { type: "integer", example: 200 },
            message:    { type: "string", example: "Operation successful" },
            data:       { type: "object" },
          },
        },

        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Something went wrong" },
            errors:  { type: "array", items: { type: "object", properties: { field: { type: "string" }, message: { type: "string" } } } },
          },
        },

        ValidationError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation failed" },
            errors: {
              type: "array",
              example: [
                { field: "email",    message: "Please enter a valid email" },
                { field: "password", message: "Password must contain uppercase, lowercase and a number" },
              ],
            },
          },
        },
      },
    },
    tags: [
      { name: "Auth",     description: "Register / Login / Logout / Token refresh" },
      { name: "Vendor",   description: "Vendor store setup and dashboard" },
      { name: "Products", description: "Product CRUD, search, stock management" },
      { name: "Cart",     description: "Persistent cart, coupon apply" },
      { name: "Orders",   description: "Stripe payments and order tracking" },
      { name: "Reviews",  description: "Verified purchase reviews and ratings" },
      { name: "Coupons",  description: "Coupon creation and management" },
      { name: "Admin",    description: "Platform administration" },
    ],
  },
  apis: ["./src/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);