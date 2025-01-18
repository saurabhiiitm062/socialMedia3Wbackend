const User = require("../models/User");

let clients = [];

const addClient = (res) => {
  clients.push(res);
};

const removeClient = (res) => {
  clients = clients.filter((client) => client !== res);
};

const notifyClients = async () => {
  const users = await User.find();
  const data = `data: ${JSON.stringify(users)}\n\n`;
  clients.forEach((client) => client.write(data));
};

module.exports = { addClient, removeClient, notifyClients };
