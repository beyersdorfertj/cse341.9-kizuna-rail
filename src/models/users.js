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

// Expects already-validated pagination values. _id is a tie-breaker so pages never overlap.
export async function getPaginatedUsers({ page, limit, sort, order }) {
  const direction = order === 'desc' ? -1 : 1;
  const [users, totalItems] = await Promise.all([
    user
      .find({})
      .select('-passwordHash')
      .sort({ [sort]: direction, _id: direction })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    user.countDocuments({}),
  ]);
  return { users, totalItems };
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
