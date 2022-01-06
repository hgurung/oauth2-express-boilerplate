const ClientModel = require("./../../models/Client");

let clientData = {
  title: "Clients1",
  grants: "password",
  server_access: 1
};
ClientModel.findAll({where:{"title":clientData["title"]}}).then(client=> {
  if (client.length === 0) {
    ClientModel.create(clientData).then(function(data) {
      console.log("New client - %s:%s", data.client_id, data.client_secret);
    });
  }
});