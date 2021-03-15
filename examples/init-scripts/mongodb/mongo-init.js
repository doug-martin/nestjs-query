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
db.createUser(
  {
    user: "typegoose",
    pwd: "typegoose",
    roles: [
      {
        role: "readWrite",
        db: "typegoose"
      }
    ]
  }
);
