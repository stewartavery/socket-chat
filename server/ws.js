var WebSocketServer = require("ws").Server,
  wss = new WebSocketServer({ port: 40510 });
const crypto = require("crypto");

const clients = new Map();

wss.on("connection", function (ws) {
  const selfIdentifier = crypto.randomUUID();
  clients.set(selfIdentifier, ws);

  ws.send(`OPEN::${selfIdentifier}`);

  ws.on("message", function (message) {
    console.log("received: %s", message);

    for (const [_, ws] of clients) {
      ws.send(`MESSAGE::${selfIdentifier}::${message}`);
    }
  });

  ws.on("close", function () {
    console.log("closed connection");
    clients.delete(selfIdentifier);
  });

  ws.on("error", function () {
    console.log(ws, "caught error");
  });
});
