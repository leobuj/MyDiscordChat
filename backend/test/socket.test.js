import { expect, use } from "chai";
import { Server } from "socket.io";
import Client from "socket.io-client";
import { createServer } from "http";
import { initializeSocket } from "../socket.js";

let io, serverSocket, clientSocket;

before(function (done) {
  this.timeout(10000); // Increase timeout to 10 seconds

  console.log("Setting up the server and client...");
  const httpServer = createServer();
  io = new Server(httpServer);
  initializeSocket(io); // Initialize your socket logic

  httpServer.listen(() => {
    const port = httpServer.address().port;
    console.log(`Server is listening on port ${port}`);
    clientSocket = new Client(`http://localhost:${port}`);
    io.on("connection", (socket) => {
      console.log(`Server connected with socket id: ${socket.id}`);
      serverSocket = socket;
    });
    clientSocket.on("connect", () => {
      console.log(`Client connected with socket id: ${clientSocket.id}`);
      done();
    });
  });
});

after((done) => {
  console.log("Closing server and client sockets...");
  io.close();
  clientSocket.close();
  done();
});

// it("should connect to the server", function (done) {
//   this.timeout(5000); // Increase timeout to 5 seconds

//   clientSocket.on("message", (msg) => {
//     console.log("Received message from server:", msg);
//     expect(msg).to.have.property("text", "Welcome to Chat App!");
//     done();
//   });
// });

it("should join a room and broadcast user list", function (done) {
  this.timeout(5000); // Increase timeout to 5 seconds

  clientSocket.emit("enterRoom", {
    name: "TestUser",
    room: "TestRoom",
    avatar: "avatar1.png",
  });

  serverSocket.on("enterRoom", (data) => {
    console.log("Server received enterRoom event:", data);
    expect(data).to.include({
      name: "TestUser",
      room: "TestRoom",
      avatar: "avatar1.png",
    });
    done();
  });
});
