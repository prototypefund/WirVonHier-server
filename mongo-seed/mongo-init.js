db = db.getSiblingDB('wirvonhier');
db.createUser(
  { user: "wirvonhier",
    pwd: "wirvonhierpass",
    roles: [ { role: "readWrite", db: "wirvonhier" } ]
  }
);
