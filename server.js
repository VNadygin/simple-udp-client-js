const dgram = require("dgram");
const socket = dgram.createSocket("udp4");

const server = require("http").createServer();
const io = require("socket.io")(server);

const UDP_PORT = process.env.UDP_PORT || 5001;
const PORT = process.env.PORT || 5000;

const handleUDPResponse = (incomeMessage, rinfo) => {
  const message = incomeMessage.toString();
  io.emit("message", message);
};

io.on("connection", ioClient => {
  socket.on("error", err => {
    console.error(`UDP error: ${err.stack}`);
  });

  socket.on("message", handleUDPResponse);

  ioClient.on("message", data => {
    const { host, port, message } = JSON.parse(data);
    const msg = Buffer.from(message);
    const client = dgram.createSocket("udp4");

    client.send(msg, port, host, err => {
      client.close();
    });
  });

  ioClient.on("disconnect", () => {
    socket.removeListener("message", handleUDPResponse);
  });
});

socket.on("listening", () => {
  const addr = socket.address();
  console.log(`Listening for UDP packets on port ${addr.port}`);
});

socket.bind(UDP_PORT);
io.listen(PORT);

io.httpServer.on("listening", () => {
  console.log("Listening for Sockets.io on port", io.httpServer.address().port);
});
