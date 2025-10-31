---- Playing Adventure Queries ----
-- Get Count of Tokens in Adventure X

-- Get Landmarks in Region X

-- Get tokens ordered by tokenOrder


---- Homepage ----
-- Get all regions made by Adventurer

-- Get all adventures sorted by distance

-- Get all adventures in Region X

---- Adventure Page ----
-- Get adventure X

---- Profile Page ----
-- Get Adventurer data X
SELECT *
  FROM Adventurer
  WHERE ID = X
  ;
-- Get count of all completed adventures by adventurer X
SELECT COUNT(*)
  FROM CompletedAdventure
  WHERE adventurerID = X
  ;
-- Get count of all tokens collected by player
SELECT COUNT(*)
  FROM Token CompletedAdventure
  WHERE CompletedAdventure.adventurerID = X
  AND Token.adventureID = CompletedAdventure.ID
  ;
-- Get count of all adventures created by player
SELECT COUNT(*)
  FROM Adventure
  WHERE adventurerID = X
  ;
-- Get all adventures completed by player sorted by completion date
SELECT *
  FROM CompletedAdventure
  WHERE playerID = 1
  ORDER BY completionDate DESC
  ;

---- Creation ----




-- Get the adventurer records.
SELECT * 
  FROM Player
  ;

-- Get all landmarks in Region 1.
SELECT *
  FROM Landmark
  WHERE regionID = 1
  ;

-- Get all tokens in Adventure 1.
SELECT *
  FROM Token
  WHERE adventureID = 1
  ;

-- Get all adventures made by player w/ ID 1
SELECT *
  FROM Adventure
  WHERE playerID = 1
  ;

-- Get all completed adventures by player w/ ID 1, sorted by most recent
SELECT *
  FROM CompletedAdventure
  WHERE playerID = 1
  ORDER BY completionDate DESC
  ;

-- Get all completed adventures by player w/ ID 1, sorted by completion time
SELECT *
  FROM CompletedAdventure
  WHERE playerID = 1
  ORDER BY completionTime
  ;
