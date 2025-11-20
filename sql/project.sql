DROP TABLE IF EXISTS CollectedToken;
DROP TABLE IF EXISTS AdventureInProgress;
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



-- CREATE TABLE CollectedToken (
--     ID SERIAL PRIMARY KEY,
--     adventureInProgressID integer REFERENCES AdventureInProgress(ID),
--     tokenID integer REFERENCES Token(ID),
    
--     collectedAt timestamp DEFAULT CURRENT_TIMESTAMP,
    
--     -- Prevent collecting same token twice in same adventure instance
--     UNIQUE(adventureInProgressID, tokenID)
-- );

-- CREATE TABLE AdventureInProgress (
--     ID SERIAL PRIMARY KEY,
--     adventurerID integer REFERENCES Adventurer(ID),
--     adventureID integer REFERENCES Adventure(ID),
    
--     dateStarted timestamp DEFAULT CURRENT_TIMESTAMP,
--     lastUpdated timestamp DEFAULT CURRENT_TIMESTAMP,
--     tokensCollected integer DEFAULT 0,
    
--     -- Prevent duplicate in-progress adventures for same user
--     UNIQUE(adventurerID, adventureID)
-- );