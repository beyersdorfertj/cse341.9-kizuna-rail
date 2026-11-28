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

export async function getAllUsers() {
  return user.find({}).select('-passwordHash').lean();
}

export async function updateUserById(id, updates) {
  return user
    .findByIdAndUpdate(id, updates, { returnDocument: 'after', runValidators: true })
    .select('-passwordHash')
    .lean();
}

export async function deleteUserById(id) {
  return user.findByIdAndDelete(id).select('-passwordHash').lean();
}
