-- SELECT *
--   FROM Player
--   ;
-- SELECT *
--   FROM Region
--   ;
-- SELECT *
--   FROM Landmark
--   ;
-- SELECT *
--   FROM Adventure
--   ;
-- SELECT *
--   FROM Token
--   ;

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

-- Get the cross-product of all the tables.
SELECT *
  FROM Player, Region, Landmark, Adventure, Token
  ;

-- -- Get the highest score ever recorded.
--   SELECT score
--     FROM PlayerGame
-- ORDER BY score DESC
--    LIMIT 1
--    ;