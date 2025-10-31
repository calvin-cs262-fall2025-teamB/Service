DROP TABLE IF EXISTS CompletedAdventure;
DROP TABLE IF EXISTS Token;
DROP TABLE IF EXISTS Adventure;
DROP TABLE IF EXISTS Landmark;
DROP TABLE IF EXISTS Region;
DROP TABLE IF EXISTS Adventurer;

CREATE TABLE Adventurer (
    ID SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    profilePicture VARCHAR(255)  -- stores something like "/images/user123.jpg"

);

CREATE TABLE Region (
    -- IDs
    ID SERIAL PRIMARY KEY,
    adventurerID integer REFERENCES Adventurer(ID),

    -- Descriptive data
    name TEXT NOT NULL,
    description TEXT,
    
    -- Region geospacial information
    location point NOT NULL,
    radius integer NOT NULL

);

CREATE TABLE Landmark (
    ID SERIAL PRIMARY KEY,
    regionID integer REFERENCES Region(ID),

    name TEXT NOT NULL,
    location point
);

CREATE TABLE Adventure (
    ID SERIAL PRIMARY KEY,
    adventurerID integer REFERENCES Adventurer(ID),
    regionID integer REFERENCES Region(ID),

    name TEXT NOT NULL,
    numTokens integer,
    location point
);

CREATE TABLE Token (
    ID SERIAL PRIMARY KEY,
    adventureID integer REFERENCES Adventure(ID),

    location point,
    hint TEXT,
    tokenOrder integer
);

CREATE TABLE CompletedAdventure (
    ID SERIAL PRIMARY KEY,
    adventurerID integer REFERENCES Adventurer(ID),
    adventureID integer REFERENCES Adventure(ID),

    -- Player Data
    completionDate date,
    completionTime interval
);

-- CREATE TABLE AdventureInProgress (
--     ID SERIAL PRIMARY KEY,
--     adventurerID integer REFERENCES Adventurer(ID),
--     adventureID integer REFERENCES Adventure(ID),

--     dateStarted date,
-- );

-- CREATE TABLE AdventureInProgressToken (
--     ID SERIAL PRIMARY KEY,
--     adventureID integer REFERENCES Adventure(ID),
--     tokenID integer REFERENCES Token(ID),

--     isCollected boolean,
-- );

GRANT SELECT ON Adventurer TO PUBLIC;
GRANT SELECT ON Region TO PUBLIC;
GRANT SELECT ON Landmark TO PUBLIC;
GRANT SELECT ON Adventure TO PUBLIC;
GRANT SELECT ON Token TO PUBLIC;
GRANT SELECT ON CompletedAdventure TO PUBLIC;

-- Add sample records
INSERT INTO Adventurer(username, password, profilePicture) VALUES ('Adventurer 1', '123', 'pictures/img1.jpg');
INSERT INTO Adventurer(username, password, profilePicture) VALUES ('Adventurer 2', '456', 'pictures/img2.jpg');
INSERT INTO Adventurer(username, password, profilePicture) VALUES ('Adventurer 3', '789', 'pictures/img3.jpg');

INSERT INTO Region(name, adventurerID, description, location, radius) VALUES ('Region 1', 1, "Region 1 Desc", POINT(0, 0), 100);
INSERT INTO Region(name, adventurerID, description, location, radius) VALUES ('Region 2', 2, "Region 2 Desc", POINT(0, 0), 100);
INSERT INTO Region(name, adventurerID, description, location, radius) VALUES ('Region 3', 3, "Region 3 Desc", POINT(0, 0), 100);

INSERT INTO Landmark(name, regionID, location) VALUES ('Landmark 1', 1, POINT(0, 0));
INSERT INTO Landmark(name, regionID, location) VALUES ('Landmark 2', 1, POINT(0, 0));
INSERT INTO Landmark(name, regionID, location) VALUES ('Landmark 3', 2, POINT(0, 0));
INSERT INTO Landmark(name, regionID, location) VALUES ('Landmark 4', 2, POINT(0, 0));
INSERT INTO Landmark(name, regionID, location) VALUES ('Landmark 5', 3, POINT(0, 0));
INSERT INTO Landmark(name, regionID, location) VALUES ('Landmark 6', 3, POINT(0, 0));

INSERT INTO Adventure(name, adventurerID, regionID, location, numTokens) VALUES ('Adventure 1', 1, 1, POINT(0, 0), 1);
INSERT INTO Adventure(name, adventurerID, regionID, location, numTokens) VALUES ('Adventure 2', 2, 1, POINT(0, 0), 2);
INSERT INTO Adventure(name, adventurerID, regionID, location, numTokens) VALUES ('Adventure 3', 3, 1, POINT(0, 0), 3);

-- Adventure 1 --
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES (1, POINT(0, 0), "Adv 1: Tok 1: Hint", 1);
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES (1, POINT(10, 10), "Adv 1: Tok 2: Hint", 2);

-- Adventure 2 --
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES (2, POINT(0, 0), "Adv 2: Tok 1: Hint", 1);
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES (2, POINT(10, 10), "Adv 2: Tok 2: Hint", 2);

-- Adventure 3 --
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES (3, POINT(0, 0), "Adv 3: Tok 1: Hint", 1);
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES (4, POINT(10, 10), "Adv 3: Tok 2: Hint", 2);

INSERT INTO CompletedAdventure(adventurerID, adventureID, completionDate, completionTime)
    VALUES (1, 2, '1000-01-13', '4:50:30');
INSERT INTO CompletedAdventure(adventurerID, adventureID, completionDate, completionTime)
    VALUES (1, 3, '1000-01-14', '5:50:30');
INSERT INTO CompletedAdventure(adventurerID, adventureID, completionDate, completionTime)
    VALUES (1, 5, '1000-01-15', '6:50:30');
INSERT INTO CompletedAdventure(adventurerID, adventureID, completionDate, completionTime)
    VALUES (1, 6, '1000-01-16', '7:50:30');
