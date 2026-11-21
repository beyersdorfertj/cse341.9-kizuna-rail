//src/controllers/auth.js
import bcrypt from "bcrypt";
import {
  getUserByUsername,
  getUserByEmail,
  createUser,
} from "../models/users.js";

export function registerPage(req, res) {
  res.render("auth/register", { title: "Register", error: null, values: {} });
}

export function loginPage(req, res) {
  res.render("auth/login", { title: "Login", error: null, values: {} });
}

export async function register(req, res) {
  try {
    const { displayName, username, email, password } = req.body;

    const fields = [displayName, username, email, password];
    if (fields.some((field) => typeof field !== "string" || !field.trim())) {
      return res.status(400).render("auth/register", {
        title: "Register",
        error: "All fields are required.",
        values: { displayName, username, email },
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await createUser({ displayName, username, email, passwordHash, role: "user" });

    return res.redirect("/login");
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).render("auth/register", {
        title: "Register",
        error: "Username or email already exists.",
        values: req.body,
      });
    }

    console.error("Error registering user:", error);

    return res.status(500).render("auth/register", {
      title: "Register",
      error: "Registration failed.",
      values: req.body,
    });
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).render("auth/login", {
        title: "Login",
        error: "Invalid credentials.",
        values: {},
      });
    }

    const user =
      (await getUserByUsername(username)) || (await getUserByEmail(username));

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).render("auth/login", {
        title: "Login",
        error: "Invalid credentials.",
        values: { username },
      });
    }

    req.session.user = {
      id: user._id.toString(),
      displayName: user.displayName,
      username: user.username,
      role: user.role,
      email: user.email
    };

    return res.redirect(user.role === "admin" ? "/admin" : "/");
  } catch (error) {
    console.error("Error logging in:", error);

    return res.status(500).render("auth/login", {
      title: "Login",
      error: "Login failed.",
      values: {},
    });
  }
}

export function logout(req, res) {
  req.session.destroy(() => res.redirect("/"));
}
