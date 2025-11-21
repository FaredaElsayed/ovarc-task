/* eslint-env node */
import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "public", "data");
const PORT = process.env.MOCK_SERVER_PORT || 4000;
const API_PREFIX = process.env.MOCK_SERVER_PREFIX || "/api";

const readJson = (filename) => {
  const filePath = path.join(DATA_DIR, filename);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
};

const dataSources = {
  stores: () => readJson("stores.json"),
  books: () => readJson("books.json"),
  authors: () => readJson("authors.json"),
  inventory: () => readJson("inventory.json"),
};

const mockUser = {
  id: 1,
  name: "ali mohamed",
  email: "ali@ovarc.dev",
  role: "admin",
};

const mockCredentials = {
  email: "admin@ovarc.dev",
  password: "password123",
};

const app = express();
app.use(cors());
app.use(express.json());

const sendHealth = (_req, res) => {
  res.json({
    status: "ok",
    message: "Mock server is running",
    endpoints: Object.keys(dataSources).map(
      (resource) => `${API_PREFIX}/${resource}`
    ),
  });
};

app.get("/", sendHealth);
app.get(API_PREFIX, sendHealth);

Object.entries(dataSources).forEach(([resource, loader]) => {
  app.get(`${API_PREFIX}/${resource}`, (_req, res) => {
    try {
      const payload = loader();
      res.json(payload);
    } catch (error) {
      console.error(`Failed to load ${resource}:`, error);
      res.status(500).json({ error: `Unable to load ${resource}` });
    }
  });
});

app.post(`${API_PREFIX}/auth/login`, (req, res) => {
  const { email, password } = req.body || {};
  if (
    email === mockCredentials.email &&
    password === mockCredentials.password
  ) {
    return res.json({
      user: mockUser,
      token: "mock-auth-token",
    });
  }
  return res.status(401).json({ error: "Invalid email or password" });
});

app.post(`${API_PREFIX}/auth/logout`, (_req, res) => {
  res.json({ status: "ok" });
});

app.get(`${API_PREFIX}/auth/me`, (_req, res) => {
  res.json({ user: mockUser });
});

app.listen(PORT, () => {
  console.log(`Mock server available at http://localhost:${PORT}${API_PREFIX}`);
});
