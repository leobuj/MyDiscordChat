// contains all data for message and returns object
export function buildMsg(name, text, avatar) {
  return {
    name,
    text,
    avatar,
    time: new Intl.DateTimeFormat("default", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(new Date()),
  };
}
