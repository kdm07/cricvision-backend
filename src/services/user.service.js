const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const { User } = require("../database/models");

async function listUsers(search) {
  const where = search
    ? {
        [Op.or]: [
          { fullName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ],
      }
    : {};

  return User.findAll({
    where,
    attributes: ["id", "fullName", "email", "role", "createdAt"], // never return passwordHash
    order: [["createdAt", "DESC"]],
  });
}

async function createUser({ fullName, email, password, role }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    const err = new Error("A user with this email already exists");
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ fullName, email, passwordHash, role });

  const { passwordHash: _omit, ...safeUser } = user.toJSON();
  return safeUser;
}

module.exports = { listUsers, createUser };
