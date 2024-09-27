import { Server } from "socket.io";
import { ADMIN, CORS_ORIGIN } from "./config.js";
import {
  getUser,
  activateUser,
  userLeavesRoom,
  getUsersInRoom,
  getAllActiveRooms,
} from "./user.js";
import { buildMsg } from "./utils.js";

// Initiliazes the actualSocket.io server
export function initializeSocket(server) {
  const io = new Server(server, {
    cors: { origin: CORS_ORIGIN },
  });

  // When server receives a connection...each user has a unique socket
  io.on("connection", (socket) => {
    console.log(`User ${socket.id} connected`);

    // We're sending the user a message from the server
    socket.emit("message", buildMsg(ADMIN, "Welcome to Chat App!"));
    // to all connected clients
    io.emit("roomList", { rooms: getAllActiveRooms() });

    // the socket is attached to a user...
    socket.on("enterRoom", ({ name, room, avatar }) =>
      handleEnterRoom(io, socket, name, room, avatar)
    );
    socket.on("disconnect", () => handleDisconnect(io, socket));
    socket.on("message", ({ name, text }) =>
      handleMessage(io, socket, name, text)
    );
    socket.on("activity", (name) => handleActivity(io, socket, name));
  });
}

// A lot of steps.
function handleEnterRoom(io, socket, name, room, avatar) {
  const prevRoom = getUser(socket.id)?.room;

  // Announce departure if user was previously in a room
  if (prevRoom) {
    socket.leave(prevRoom);
    io.to(prevRoom).emit(
      "message",
      buildMsg(ADMIN, `${name} has left the room`)
    );
  }

  // New room, new activation.
  const user = activateUser(socket.id, name, room, avatar);

  // Cant update prev room userslist until after the state update in activate user
  if (prevRoom) {
    io.to(prevRoom).emit("userList", { users: getUsersInRoom(prevRoom) });
  }

  socket.join(user.room);

  socket.emit(
    "message",
    buildMsg(ADMIN, `You have joined the ${user.room} chat room`, avatar)
  );

  // Announce new arrival
  socket.broadcast
    .to(user.room)
    .emit(
      "message",
      buildMsg(ADMIN, `${user.name} has joined the chat room`, avatar)
    );

  io.to(user.room).emit("userList", { users: getUsersInRoom(user.room) });
  io.emit("roomList", { rooms: getAllActiveRooms() });
}

function handleDisconnect(io, socket) {
  const user = getUser(socket.id);
  userLeavesRoom(socket.id);

  if (user) {
    io.to(user.room).emit(
      "message",
      buildMsg(ADMIN, `${user.name} has left the room`, user.avatar)
    );
    io.to(user.room).emit("userList", { users: getUsersInRoom(user.room) });
    io.emit("roomList", { rooms: getAllActiveRooms() });
  }

  console.log(`User ${socket.id} has disconnected from room ${user?.room}`);
}

function handleMessage(io, socket, name, text) {
  const user = getUser(socket.id);
  const room = user?.room;
  if (room) {
    // a room is a local grouping of sockets, so we can directly talk to them
    io.to(room).emit("message", buildMsg(name, text, user.avatar));
  }
}

function handleActivity(io, socket, name) {
  const user = getUser(socket.id);
  const room = user?.room;
  if (room) {
    socket.broadcast.to(room).emit("activity", name);
  }
}
