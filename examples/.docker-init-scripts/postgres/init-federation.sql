CREATE USER federation_sub_task WITH SUPERUSER;
CREATE DATABASE federation_sub_task;
GRANT ALL PRIVILEGES ON DATABASE federation_sub_task TO federation_sub_task;

CREATE USER federation_tag WITH SUPERUSER;
CREATE DATABASE federation_tag;
GRANT ALL PRIVILEGES ON DATABASE federation_tag TO federation_tag;

CREATE USER federation_todo_item WITH SUPERUSER;
CREATE DATABASE federation_todo_item;
GRANT ALL PRIVILEGES ON DATABASE federation_todo_item TO federation_todo_item;

CREATE USER federation_user WITH SUPERUSER;
CREATE DATABASE federation_user;
GRANT ALL PRIVILEGES ON DATABASE federation_user TO federation_user;
