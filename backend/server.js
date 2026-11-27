require("dotenv").config();

const REQUIRED_ENV_VARS = [
  "MONGO_URI",
  "JWT_SECRET",
  "GOOGLE_CLIENT_ID",
  "IMAGEKIT_PRIVATE_KEY",
  "IMAGEKIT_PUBLIC_KEY",
  "IMAGEKIT_URL_ENDPOINT",
];

const missingEnv = REQUIRED_ENV_VARS.filter(
  (key) => !process.env[key] || String(process.env[key]).trim() === ""
);

if (missingEnv.length > 0) {
  console.error(
    `Fatal startup error: Missing required environment variable(s): ${missingEnv.join(", ")}`
  );
  process.exit(1);
}

const app = require("./src/app");
const connectDB = require("./src/db/db");

connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
