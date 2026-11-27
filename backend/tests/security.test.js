import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

// Ensure JWT_SECRET exists before importing app/controllers
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_for_vitest";
process.env.IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || "test_private_key";
process.env.IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY || "test_public_key";
process.env.IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/test";
const app = require("../src/app");
const userModel = require("../src/models/user.model");
const musicModel = require("../src/models/music.model");
const musicApiService = require("../src/services/musicApi.service");

describe("RuVibe Security & Auth Tests", () => {
  let listenerToken;
  let artistToken;

  beforeAll(() => {
    listenerToken = jwt.sign(
      { id: "507f1f77bcf86cd799439011", role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    artistToken = jwt.sign(
      { id: "507f1f77bcf86cd799439012", role: "artist" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Missing token must be rejected
  it("1. Rejects GET /api/music/my-uploads without a token (401)", async () => {
    const res = await request(app).get("/api/music/my-uploads");
    expect(res.status).toBe(401);
  });

  // 2. Role-Based Access Control (RBAC): Listener cannot access Artist upload
  it("2. Blocks user-role token from POST /api/music/upload (403)", async () => {
    const res = await request(app)
      .post("/api/music/upload")
      .set("Authorization", `Bearer ${listenerToken}`);

    expect(res.status).toBe(403);
  });

  // 3. Tampered / invalid JWT must be rejected
  it("3. Rejects tampered JWT on GET /api/auth/me (401)", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer fake.tampered.token");

    expect(res.status).toBe(401);
  });

  // 4. Privilege escalation protection on registration
  it("4. Sanitizes role='admin' to 'user' on POST /api/auth/register", async () => {
    vi.spyOn(userModel, "findOne").mockResolvedValue(null);
    vi.spyOn(userModel.prototype, "save").mockResolvedValue(true);

    const res = await request(app).post("/api/auth/register").send({
      username: "sec_tester",
      email: "sectester@example.com",
      password: "password123",
      role: "admin",
    });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("user");
  });

  // 5. File upload MIME type validation (Multer filter)
  it("5. Rejects non-audio file upload on POST /api/music/upload", async () => {
    const res = await request(app)
      .post("/api/music/upload")
      .set("Authorization", `Bearer ${artistToken}`)
      .field("title", "Fake Track")
      .attach("file", Buffer.from("not-an-audio-file"), {
        filename: "malware.exe",
        contentType: "application/x-msdownload",
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  // 6. ReDoS / Regex injection protection on search
  it("6. Handles regex special characters safely on GET /api/music/search", async () => {
    const chain = {
      populate: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    };
    vi.spyOn(musicModel, "find").mockReturnValue(chain);
    vi.spyOn(musicApiService, "searchGlobalTracks").mockResolvedValue([]);

    const res = await request(app).get(
      `/api/music/search?q=${encodeURIComponent("*+?^${}()|[]\\")}`
    );

    expect(res.status).toBe(200);
  });

  // 7. Rate limiter protection against brute-force login
  // Run last so the 25-request limit doesn't affect earlier auth tests
  it("7. Triggers 429 Too Many Requests after 25 POST /api/auth/login attempts", async () => {
    vi.spyOn(userModel, "findOne").mockResolvedValue(null);

    let lastStatus = 0;
    for (let i = 0; i < 26; i++) {
      const res = await request(app).post("/api/auth/login").send({
        username: "nonexistent_user",
        password: "wrongpassword",
      });
      lastStatus = res.status;
    }

    expect(lastStatus).toBe(429);
  });
});