DROP TABLE IF EXISTS CompletedAdventure;
DROP TABLE IF EXISTS Token;
DROP TABLE IF EXISTS Adventure;
DROP TABLE IF EXISTS Landmark;
DROP TABLE IF EXISTS Region;
DROP TABLE IF EXISTS Player;

CREATE TABLE Player (
    ID SERIAL PRIMARY KEY,
    name varchar(50) NOT NULL
);

CREATE TABLE Region (
    ID SERIAL PRIMARY KEY,
    name varchar(50) NOT NULL,
    playerID integer REFERENCES Player(ID),
    location point
);

CREATE TABLE Landmark (
    ID SERIAL PRIMARY KEY,
    name varchar(50) NOT NULL,
    regionID integer REFERENCES Region(ID),
    location point
);

CREATE TABLE Adventure (
    ID SERIAL PRIMARY KEY,
    name varchar(50) NOT NULL,
    playerID integer REFERENCES Player(ID),
    regionID integer REFERENCES Region(ID),
    location point
);

CREATE TABLE Token (
    ID SERIAL PRIMARY KEY,
    adventureID integer REFERENCES Adventure(ID),
    location point
);

CREATE TABLE CompletedAdventure (
    playerID integer REFERENCES Player(ID),
    adventureID integer REFERENCES Adventure(ID),
    completionDate date,
    completionTime interval
);

GRANT SELECT ON Player TO PUBLIC;
GRANT SELECT ON Region TO PUBLIC;
GRANT SELECT ON Landmark TO PUBLIC;
GRANT SELECT ON Adventure TO PUBLIC;
GRANT SELECT ON Token TO PUBLIC;
GRANT SELECT ON CompletedAdventure TO PUBLIC;

-- Add sample records
INSERT INTO Player(name) VALUES ('Jacob');
INSERT INTO Player(name) VALUES ('Billy Bob Joe');

INSERT INTO Region(name, playerID, location) VALUES ('Calvin University', 1, POINT(0, 0));
INSERT INTO Region(name, playerID, location) VALUES ('Hope', 2, POINT(1, 1));

INSERT INTO Landmark(name, regionID, location) VALUES ('Cheeze Statue', 1, POINT(0, 0));
INSERT INTO Landmark(name, regionID, location) VALUES ('SB Vending Machine', 1, POINT(0, 0));
INSERT INTO Landmark(name, regionID, location) VALUES ('Dining Hall', 2, POINT(1, 1));

INSERT INTO Adventure(name, playerID, regionID, location) VALUES (1, 1, 1, POINT(0, 0));
INSERT INTO Adventure(name, playerID, regionID, location) VALUES (2, 2, 2, POINT(1, 1));

INSERT INTO Token(adventureID, location) VALUES (1, POINT(0, 0));
INSERT INTO Token(adventureID, location) VALUES (1, POINT(10, 10));
INSERT INTO Token(adventureID, location) VALUES (2, POINT(2, 2));

INSERT INTO CompletedAdventure(playerID, adventureID, completionDate, completionTime)
    VALUES (1, 1, '1000-01-13', '1:50:30');