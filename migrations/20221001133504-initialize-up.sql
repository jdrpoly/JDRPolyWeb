----- USERS TABLE -----

CREATE TABLE public.users(
	id SERIAL PRIMARY KEY,
	email VARCHAR(255) NOT NULL,
	role VARCHAR(255) NOT NULL,
	name VARCHAR(255),
	account_creation DATE NOT NULL DEFAULT CURRENT_DATE,
	discord_id VARCHAR(255),
	bio TEXT,
	member_start DATE,
	member_stop DATE
);

---- COOKIES TABLE -----

CREATE TABLE public.sessions(
	cookieId VARCHAR(255) NOT NULL,
	user_id INT NOT NULL,
	expiration_date DATE NOT NULL,
	CONSTRAINT cookieId_pk PRIMARY KEY (cookieId)
);

ALTER TABLE public.sessions
    ADD CONSTRAINT user_id_fk FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON DELETE CASCADE ON UPDATE CASCADE;

 ----- EMAIL VALIDATION CODE TABLE -----

CREATE TABLE public.email_validation(
	id INT PRIMARY KEY NOT NULL,
	validation_token VARCHAR(255) NOT NULL
);

 ----- MEMBER CODE TABLE -----

CREATE TABLE public.members_code(
	validation_token VARCHAR(255) PRIMARY KEY NOT NULL,
	periods INT NOT NULL,
	code_creation DATE NOT NULL DEFAULT CURRENT_DATE
);

 ----- EVENTS TABLE -----

CREATE TABLE IF NOT EXISTS public.events(
	id SERIAL NOT NULL,
	title VARCHAR(255) NOT NULL,
	author INT NOT NULL,
	category VARCHAR(255) NOT NULL,
	date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	inscription BOOLEAN NOT NULL DEFAULT true,
	inscription_group VARCHAR(255) NOT NULL DEFAULT 'USER',
	inscription_start TIMESTAMP WITHOUT TIME ZONE,
	inscription_stop TIMESTAMP WITHOUT TIME ZONE,
	description TEXT,
	CONSTRAINT events_pk PRIMARY KEY (id)
);

ALTER TABLE public.events
	ADD CONSTRAINT author_fk FOREIGN KEY (author) 
		REFERENCES public.users (id) MATCH SIMPLE
		ON DELETE NO ACTION ON UPDATE CASCADE;


----- EVENT INSCRIPTION TABLE -----

CREATE TABLE public.event_inscription
(
    user_id             INT NOT NULL,
    event_id            INT NOT NULL,
    CONSTRAINT event_inscription_pk PRIMARY KEY (user_id, event_id)
);

ALTER TABLE public.event_inscription
    ADD CONSTRAINT user_id_fk FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public.event_inscription
    ADD CONSTRAINT event_id_fk FOREIGN KEY (event_id)
        REFERENCES public.events (id) MATCH SIMPLE
        ON DELETE CASCADE ON UPDATE CASCADE;

----- COMMITTEE INFO TABLE -----
CREATE TABLE public.committee_info
(
	id					SERIAL NOT NULL,
    category 			VARCHAR(255) NOT NULL,
	title				VARCHAR(255) NOT NULL,
	item_order 			SMALLINT NOT NULL,
	name				VARCHAR(255) DEFAULT '',
	description			TEXT,
	CONSTRAINT id_pk PRIMARY KEY (id)
);

----- BOOKS TABLE -----
CREATE TABLE public.books
(
	id					SERIAL PRIMARY KEY,
	title				VARCHAR(255) NOT NULL,
	item_order 			SMALLINT NOT NULL,
	caution				TEXT,
	status				VARCHAR(255)		
);

----- HONOR MEMBERS TABLE -----
CREATE TABLE public.honor_members
(
	id					SERIAL PRIMARY KEY,
	name				VARCHAR(255) NOT NULL,
	item_order 			SMALLINT NOT NULL,
	description			TEXT
);