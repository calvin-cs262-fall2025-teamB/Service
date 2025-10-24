-- Get the player records.
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

-- Get all completed adventures by player w/ ID 1
SELECT *
  FROM CompletedAdventure
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




-- -- Get the cross-product of all the tables.
-- SELECT *
--   FROM Player, Region, Landmark, Adventure, Token
--   ;