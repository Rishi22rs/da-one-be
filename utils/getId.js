const { v4: uuidv4 } = require("uuid");

exports.getId = () => {
  return uuidv4();
};