const { validationResult } = require("express-validator");
const userService = require("../services/user.service");

exports.listUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const users = await userService.listUsers(search);
    res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    console.log(req.body, "req.body4554");
    const user = await userService.createUser(req.body);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};
