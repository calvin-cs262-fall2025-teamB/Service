DROP TABLE IF EXISTS CollectedToken;
DROP TABLE IF EXISTS AdventureInProgress;
DROP TABLE IF EXISTS CompletedAdventure;
DROP TABLE IF EXISTS Token;
DROP TABLE IF EXISTS Adventure;
DROP TABLE IF EXISTS Landmark;
DROP TABLE IF EXISTS Region;
DROP TABLE IF EXISTS Adventurer;

CREATE TABLE Adventurer (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    profilePicture VARCHAR(255)  -- stores something like "/images/user123.jpg"

);

CREATE TABLE Region (
    -- IDs
    id SERIAL PRIMARY KEY,
    adventurerID integer REFERENCES Adventurer(ID),

    -- Descriptive data
    name TEXT NOT NULL,
    description TEXT,
    
    -- Region geospacial information
    location point NOT NULL,
    radius integer NOT NULL

);

CREATE TABLE Landmark (
    id SERIAL PRIMARY KEY,
    regionID integer REFERENCES Region(ID),

    name TEXT NOT NULL,
    location point
);

CREATE TABLE Adventure (
    id SERIAL PRIMARY KEY,
    adventurerid integer REFERENCES Adventurer(ID),
    regionid integer REFERENCES Region(ID),

    name TEXT NOT NULL,
    numTokens integer,
    location point
);

CREATE TABLE Token (
    id SERIAL PRIMARY KEY,
    adventureid integer REFERENCES Adventure(ID),

    location point,
    hint TEXT,
    tokenOrder integer
);

CREATE TABLE CompletedAdventure (
    id SERIAL PRIMARY KEY,
    adventurerid integer REFERENCES Adventurer(ID),
    adventureid integer REFERENCES Adventure(ID),

    -- Player Data
    completionDate date,
    completionTime interval
);