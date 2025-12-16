-- ---- Playing Adventure Queries ----
-- -- Get Count of Tokens in Adventure X

-- -- Get Landmarks in Region X
-- SELECT *
--   FROM Landmark
--   WHERE regionID = 1
--   ;

-- -- Get tokens in adventure X ordered by tokenOrder
-- SELECT *
--   FROM Token
--   WHERE adventureID = 1
--   ORDER BY tokenOrder
--   ;

-- ---- Homepage ----
-- -- Get all regions made by Adventurer X
-- SELECT *
--   FROM Region
--   WHERE Region.AdventurerID = 1
--   ;

-- -- -- Get all adventures sorted by distance
-- -- SELECT *
-- --   FROM Adventure
-- --   ORDER BY SQRT(playerLocation - Adventure.location) DESC;
-- --   ;

-- -- Get all adventures in Region X
-- SELECT *
--   FROM Adventure
--   WHERE Adventure.regionID = 1
--   ;

-- ---- Adventure Page ----
-- -- Get adventure X
-- SELECT *
--   FROM Adventure
--   WHERE ID = 1
--   ;

-- ---- Profile Page ----
-- -- Get Adventurer data X
-- SELECT *
--   FROM Adventurer
--   WHERE ID = 1
--   ;
-- -- Get count of all completed adventures by adventurer X
-- SELECT COUNT(*)
--   FROM CompletedAdventure
--   WHERE adventurerID = 1
--   ;
-- -- Get count of all tokens collected by player
-- SELECT COUNT(*)
--   FROM Token, CompletedAdventure
--   WHERE CompletedAdventure.adventurerID = 1
--   AND Token.adventureID = CompletedAdventure.adventureID
--   ;
-- -- Get count of all adventures created by player
-- SELECT COUNT(*)
--   FROM Adventure
--   WHERE adventurerID = 1
--   ;
-- -- Get all adventures completed by player sorted by completion date (most recent)
-- SELECT *
--   FROM CompletedAdventure
--   WHERE adventurerID = 1
--   ORDER BY completionDate DESC
--   ;

-- ---- Creation ----


-- SELECT *
--   FROM Adventurer
--   ;
SELECT *
  FROM Region
  ;
-- SELECT *
--   FROM Landmark
--   ;
-- SELECT *
--   FROM Adventure
--   ;
-- SELECT *
--   FROM Token
--   ;
-- SELECT *
--   FROM CompletedAdventure
--   ;
