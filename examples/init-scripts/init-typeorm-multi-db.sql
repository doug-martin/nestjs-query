CREATE USER typeorm_multidb_1 WITH SUPERUSER;
CREATE DATABASE typeorm_multidb_1;
GRANT ALL PRIVILEGES ON DATABASE typeorm_multidb_1 TO typeorm_multidb_1;

CREATE USER typeorm_multidb_2 WITH SUPERUSER;
CREATE DATABASE typeorm_multidb_2;
GRANT ALL PRIVILEGES ON DATABASE typeorm_multidb_2 TO typeorm_multidb_2;
