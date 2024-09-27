export const PORT = process.env.PORT || 3500;
export const ADMIN = "Admin";
export const CORS_ORIGIN =
  process.env.NODE_ENV === "production"
    ? false
    : [
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://192.168.1.105:5500",
        "http://192.168.1.68:5500",
      ];
