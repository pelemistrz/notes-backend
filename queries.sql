CREATE TABLE users
(
    id SERIAL PRIMARY KEY,
    name character varying(30) NOT NULL,
    email character varying(50)  NOT NULL,
    password character varying(250),
    CONSTRAINT users_email_key UNIQUE (email)
)

insert into users (name,email,password) values ('Marcin','test@test.com','test');


CREATE TABLE notes
(
    id SERIAL PRIMARY KEY,
    title character varying(250) NOT NULL,
    content text ,
    user_id integer,   
    CONSTRAINT notes_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

insert into notes (title,content,user_id) values ('note 1','note 1 content', 1);


curl -X POST http://localhost:3100/api/register -H "Content-Type: application/json" -d '{"name":"test","email":"test@example.com","password":"password123"}'
