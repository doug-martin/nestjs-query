db.createUser(
  {
    user: "mongoose",
    pwd: "mongoose",
    roles: [
      {
        role: "readWrite",
        db: "mongoose"
      }
    ]
  }
);
