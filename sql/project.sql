DROP TABLE IF EXISTS Adventure;
DROP TABLE IF EXISTS Region;
DROP TABLE IF EXISTS User;

CREATE TABLE User (
    ID SERIAL PRIMARY KEY,
    name varchar(50) NOT NULL,
)

CREATE TABLE Region (
    ID SERIAL PRIMARY KEY,
    name varchar(50) NOT NULL,
    userID integer REFERENCES User(ID),
    location integer[],
    -- landmarks (landmark data type),
    -- image (image),
    -- description varchar(num),
);


CREATE TABLE Adventure (
    ID SERIAL PRIMARY KEY,
    userID REFERENCES User(ID),
    regionID REFERENCES Region(ID),
    location integer[],
    -- tokens (token data type),
    -- image (image),
    -- description varchar(num),    
);

CREATE TABLE CompletedAdventure(
    ID SERIAL PRIMARY KEY,
    userID REFERENCES User(ID),
    adventureID REFERENCES Adventure(ID),
    completionDate date,
    completionTime timestamp,
)