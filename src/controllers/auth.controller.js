const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const { PrismaClient } = require("@prisma/client");

const { User } = require("../database/models");

// const prisma = new UserClient();

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_TTL = process.env.JWT_EXPIRES_IN;


function toPublicUser(user) {
  const data = user.toJSON();
  delete data.passwordHash;
  return data;
}

function signToken(user) {
  return jwt.sign({ role: user.role }, JWT_SECRET, {
    subject: user.id,
    expiresIn: TOKEN_TTL,
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      where: { email },
    });


    // Same generic error whether the email doesn't exist or the password
    // is wrong — don't leak which one it was.
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user);
    return res.status(200).json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error("Login error:", err);
    return res
      .status(500)
      .json({ error: "Something went wrong, please try again" });
  }
}

async function me(req, res) {
  try {

const user = await User.findByPk(req.user.id);


    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json({ user: toPublicUser(user) });
  } catch (err) {
    console.error("Me error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

module.exports = { login, me };
