import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

function signToken(user) {
  return jwt.sign(
    { id: user.user_id, username: user.user_username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function publicUser(row) {
  return {
    id: row.user_id,
    username: row.user_username,
    email: row.user_email,
    createdAt: row.created_at,
  };
}

export async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email and password are required." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    const [existing] = await pool.query(
      "SELECT user_id FROM user WHERE user_email = ? OR user_username = ?",
      [email, username]
    );
    if (existing.length > 0) {
      return res
        .status(409)
        .json({ message: "Username or email already in use." });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO user (user_username, user_email, user_pass) VALUES (?, ?, ?)",
      [username, email, hash]
    );

    const [rows] = await pool.query("SELECT * FROM user WHERE user_id = ?", [
      result.insertId,
    ]);
    const user = rows[0];
    const token = signToken(user);

    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "Username/email and password are required." });
    }

    const [rows] = await pool.query(
      "SELECT * FROM user WHERE user_email = ? OR user_username = ?",
      [identifier, identifier]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.user_pass);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const [rows] = await pool.query("SELECT * FROM user WHERE user_id = ?", [
      req.user.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ user: publicUser(rows[0]) });
  } catch (err) {
    next(err);
  }
}
