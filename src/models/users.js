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

// Escape user text so it is matched literally, not as a regex pattern.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Build the MongoDB filter conditionally: only add a condition when its value is present.
// Text search uses a case-insensitive regex (substring match) on displayName/email, not a $text index.
const buildUserFilter = ({ q, role, status, createdAfter, createdBefore } = {}) => {
  const filter = {};

  if (q) {
    const pattern = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ displayName: pattern }, { email: pattern }];
  }
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (createdAfter || createdBefore) {
    filter.createdAt = {};
    if (createdAfter) filter.createdAt.$gte = createdAfter;
    if (createdBefore) filter.createdAt.$lte = createdBefore;
  }

  return filter;
};

// Expects already-validated values. totalItems counts only matching users.
// _id is a tie-breaker so pages never overlap.
export async function getPaginatedUsers({ filters, page, limit, sort, order }) {
  const direction = order === 'desc' ? -1 : 1;
  const filter = buildUserFilter(filters);
  const [users, totalItems] = await Promise.all([
    user
      .find(filter)
      .select('-passwordHash')
      .sort({ [sort]: direction, _id: direction })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    user.countDocuments(filter),
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
