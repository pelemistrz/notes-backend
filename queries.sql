CREATE TABLE users
(
    id SERIAL PRIMARY KEY,
    name character varying(30) NOT NULL,
    email character varying(50)  NOT NULL,
    password character varying(250),
    CONSTRAINT users_email_key UNIQUE (email)
)


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
