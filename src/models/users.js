//src/models/users.js.
import user from "./schemas/users.js";

export async function getUserByUsername(username) {
  return user.findOne({ username }).lean();
}

export async function getUserByEmail(email) {
  return user.findOne({ email }).lean();
}

export async function getUserById(id) {
  return user.findById(id).lean();
}

export async function createUser(data) {
  return user.create(data);
}
