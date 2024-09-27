// Number of users will be dynamic
const UsersState = {
  users: [],
  setUsers(newUsersArray) {
    this.users = newUsersArray;
  },
};

// Called when User joins a room
export function activateUser(id, name, room, avatar) {
  const user = { id, name, room, avatar };
  UsersState.setUsers([
    ...UsersState.users.filter((user) => user.id !== id),
    user,
  ]);
  return user;
}

export function userLeavesRoom(id) {
  UsersState.setUsers(UsersState.users.filter((user) => user.id !== id));
}

export function getUser(id) {
  return UsersState.users.find((user) => user.id === id);
}

export function getUsersInRoom(room) {
  return UsersState.users.filter((user) => user.room === room);
}

// Used for Rooms List display
export function getAllActiveRooms() {
  return Array.from(new Set(UsersState.users.map((user) => user.room)));
}
