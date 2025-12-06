-- Mock Data for Adventure Game Database
-- This file contains comprehensive test data for all tables

-- Clear existing data (in dependency order)
-- DELETE FROM CollectedToken;
-- DELETE FROM AdventureInProgress;
DELETE FROM CompletedAdventure;
DELETE FROM Token;
DELETE FROM Adventure;
DELETE FROM Landmark;
DELETE FROM Region;
DELETE FROM Adventurer;

-- Reset sequences
ALTER SEQUENCE adventurer_id_seq RESTART WITH 1;
ALTER SEQUENCE region_id_seq RESTART WITH 1;
ALTER SEQUENCE landmark_id_seq RESTART WITH 1;
ALTER SEQUENCE adventure_id_seq RESTART WITH 1;
ALTER SEQUENCE token_id_seq RESTART WITH 1;
ALTER SEQUENCE completedadventure_id_seq RESTART WITH 1;
-- ALTER SEQUENCE adventureinprogress_id_seq RESTART WITH 1;
-- ALTER SEQUENCE collectedtoken_id_seq RESTART WITH 1;

-- Insert Adventurers (15 users)
INSERT INTO Adventurer(username, password, profilePicture) VALUES 
    ('AdventureSeeker', 'pass123', 'pictures/avatar1.jpg'),
    ('ExplorerMax', 'secure456', 'pictures/avatar2.jpg'),
    ('QuestMaster', 'password789', 'pictures/avatar3.jpg'),
    ('TreasureHunter', 'hunt2024', 'pictures/avatar4.jpg'),
    ('WandererSarah', 'explore99', 'pictures/avatar5.jpg'),
    ('TrailBlazer', 'trail2024', 'pictures/avatar6.jpg'),
    ('AdventureAlex', 'adventure1', 'pictures/avatar7.jpg'),
    ('ScopeRunner', 'scope456', 'pictures/avatar8.jpg'),
    ('PathFinder', 'path2024', 'pictures/avatar9.jpg'),
    ('QuestJordan', 'jordan123', 'pictures/avatar10.jpg'),
    ('ExploreEmma', 'emma2024', 'pictures/avatar11.jpg'),
    ('AdventureJake', 'jake789', 'pictures/avatar12.jpg'),
    ('SeekSamantha', 'sam2024', 'pictures/avatar13.jpg'),
    ('RoamRyan', 'ryan456', 'pictures/avatar14.jpg'),
    ('QuestQuinn', 'quinn789', 'pictures/avatar15.jpg'),
    -- User Test Data
    ('dev', 'Adventure123!', 'pictures/avatar16.jpg');

-- Insert Regions (12 regions across different locations)
INSERT INTO Region(name, adventurerID, description, location, radius) VALUES 
    ('Downtown Historic District', 1, 'Explore the rich history of downtown with landmarks dating back to the 1800s', POINT(42.9634, -85.6681), 500),
    ('Riverside Nature Trail', 2, 'Beautiful walking paths along the river with wildlife viewing opportunities', POINT(42.9704, -85.6584), 750),
    ('University Campus', 3, 'Discover hidden gems and interesting facts about the campus grounds', POINT(42.9313, -85.5881), 400),
    ('Woodland Park Adventure', 4, 'Family-friendly adventure through scenic woodland trails', POINT(42.9245, -85.6234), 600),
    ('City Center Quest', 5, 'Urban adventure through the bustling city center and shopping districts', POINT(42.9616, -85.6557), 350),
    ('Lakefront Discovery', 6, 'Scenic adventure along the beautiful lakefront with water activities', POINT(42.9789, -85.6423), 800),
    ('Heritage Village', 7, 'Step back in time exploring historical buildings and cultural sites', POINT(42.9456, -85.6789), 450),
    ('Science District', 8, 'Interactive adventure through museums and science centers', POINT(42.9567, -85.6345), 300),
    ('Art Gallery Walk', 9, 'Creative journey through local art galleries and street art', POINT(42.9678, -85.6512), 250),
    ('Sports Complex Challenge', 10, 'Athletic adventure through various sports facilities and stadiums', POINT(42.9389, -85.6678), 400),
    ('Mountain View Trail', 11, 'Challenging hike with breathtaking mountain views and photo opportunities', POINT(42.9812, -85.7123), 1000),
    ('Garden District Stroll', 12, 'Peaceful walk through beautiful gardens and botanical displays', POINT(42.9234, -85.6456), 350),
    -- Uer Test Data
    ('Test Zone Alpha', 1, 'Easy test region for demos and user testing', POINT(42.9300, -85.6500), 200),
    ('Demo Area Beta', 2, 'Simple demo area with clear landmarks', POINT(42.9400, -85.6600), 150),
    ('Practice Ground', 3, 'Perfect for first-time users to learn the app', POINT(42.9500, -85.6700), 100);

-- Insert Landmarks (36 landmarks, 3 per region)
INSERT INTO Landmark(name, regionID, location) VALUES 
    -- Downtown Historic District (Region 1)
    ('Old Town Hall', 1, POINT(42.9628, -85.6675)),
    ('Historic Clock Tower', 1, POINT(42.9640, -85.6687)),
    ('Heritage Museum', 1, POINT(42.9622, -85.6693)),
    
    -- Riverside Nature Trail (Region 2)
    ('River Overlook', 2, POINT(42.9710, -85.6578)),
    ('Wildlife Observation Deck', 2, POINT(42.9698, -85.6590)),
    ('Fishing Pier', 2, POINT(42.9716, -85.6572)),
    
    -- University Campus (Region 3)
    ('Main Library', 3, POINT(42.9307, -85.5875)),
    ('Student Union', 3, POINT(42.9319, -85.5887)),
    ('Science Building', 3, POINT(42.9301, -85.5869)),
    
    -- Woodland Park Adventure (Region 4)
    ('Ancient Oak Tree', 4, POINT(42.9239, -85.6228)),
    ('Hidden Waterfall', 4, POINT(42.9251, -85.6240)),
    ('Forest Clearing', 4, POINT(42.9233, -85.6222)),
    
    -- City Center Quest (Region 5)
    ('Central Fountain', 5, POINT(42.9610, -85.6551)),
    ('Shopping Plaza', 5, POINT(42.9622, -85.6563)),
    ('Business District', 5, POINT(42.9604, -85.6545)),
    
    -- Lakefront Discovery (Region 6)
    ('Lighthouse Point', 6, POINT(42.9795, -85.6417)),
    ('Sandy Beach', 6, POINT(42.9783, -85.6429)),
    ('Boat Launch', 6, POINT(42.9801, -85.6411)),
    
    -- Heritage Village (Region 7)
    ('Blacksmith Shop', 7, POINT(42.9450, -85.6783)),
    ('Old School House', 7, POINT(42.9462, -85.6795)),
    ('Village Church', 7, POINT(42.9444, -85.6777)),
    
    -- Science District (Region 8)
    ('Planetarium', 8, POINT(42.9561, -85.6339)),
    ('Natural History Museum', 8, POINT(42.9573, -85.6351)),
    ('Technology Center', 8, POINT(42.9555, -85.6333)),
    
    -- Art Gallery Walk (Region 9)
    ('Modern Art Gallery', 9, POINT(42.9672, -85.6506)),
    ('Sculpture Garden', 9, POINT(42.9684, -85.6518)),
    ('Street Art Mural', 9, POINT(42.9666, -85.6500)),
    
    -- Sports Complex Challenge (Region 10)
    ('Main Stadium', 10, POINT(42.9383, -85.6672)),
    ('Tennis Courts', 10, POINT(42.9395, -85.6684)),
    ('Swimming Pool', 10, POINT(42.9377, -85.6666)),
    
    -- Mountain View Trail (Region 11)
    ('Summit Viewpoint', 11, POINT(42.9818, -85.7117)),
    ('Eagle Rock', 11, POINT(42.9806, -85.7129)),
    ('Pine Grove Rest Area', 11, POINT(42.9824, -85.7105)),
    
    -- Garden District Stroll (Region 12)
    ('Rose Garden', 12, POINT(42.9228, -85.6450)),
    ('Butterfly Conservatory', 12, POINT(42.9240, -85.6462)),
    ('Herb Garden', 12, POINT(42.9222, -85.6444)),
    
    -- User Test Data
    -- Test Zone Alpha (Region 13)
    ('Test Point A', 13, POINT(42.9295, -85.6495)),
    ('Test Point B', 13, POINT(42.9305, -85.6505)),
    ('Test Point C', 13, POINT(42.9285, -85.6485)),
    
    -- Demo Area Beta (Region 14)
    ('Demo Marker 1', 14, POINT(42.9395, -85.6595)),
    ('Demo Marker 2', 14, POINT(42.9405, -85.6605)),
    ('Demo Marker 3', 14, POINT(42.9385, -85.6585)),
    
    -- Practice Ground (Region 15)
    ('Start Here', 15, POINT(42.9495, -85.6695)),
    ('Middle Point', 15, POINT(42.9505, -85.6705)),
    ('Finish Line', 15, POINT(42.9485, -85.6685));

-- Insert Adventures (24 adventures with varying difficulty)
INSERT INTO Adventure(name, adventurerID, regionID, location, numTokens) VALUES 
    -- Easy Adventures (2-3 tokens)
    ('Historic Downtown Walking Tour', 1, 1, POINT(42.9634, -85.6681), 3),
    ('Peaceful River Walk', 2, 2, POINT(42.9704, -85.6584), 2),
    ('Campus Discovery', 3, 3, POINT(42.9313, -85.5881), 3),
    ('Family Forest Fun', 4, 4, POINT(42.9245, -85.6234), 2),
    ('City Center Scavenger Hunt', 5, 5, POINT(42.9616, -85.6557), 3),
    ('Lakefront Leisure', 6, 6, POINT(42.9789, -85.6423), 2),
    
    -- Medium Adventures (4-5 tokens)
    ('Heritage Time Travel', 7, 7, POINT(42.9456, -85.6789), 4),
    ('Science Explorer Challenge', 8, 8, POINT(42.9567, -85.6345), 5),
    ('Art Appreciation Quest', 9, 9, POINT(42.9678, -85.6512), 4),
    ('Athletic Achievement Hunt', 10, 10, POINT(42.9389, -85.6678), 4),
    ('Garden Paradise Tour', 12, 12, POINT(42.9234, -85.6456), 4),
    ('Urban Photography Walk', 1, 5, POINT(42.9620, -85.6560), 5),
    
    -- Hard Adventures (6+ tokens)
    ('Mountain Summit Challenge', 11, 11, POINT(42.9812, -85.7123), 6),
    ('Ultimate City Explorer', 2, 1, POINT(42.9630, -85.6685), 7),
    ('Nature Photography Marathon', 3, 2, POINT(42.9708, -85.6580), 6),
    ('Academic Treasure Hunt', 4, 3, POINT(42.9315, -85.5885), 6),
    ('Forest Survival Challenge', 5, 4, POINT(42.9247, -85.6238), 8),
    ('Complete Lakefront Adventure', 6, 6, POINT(42.9792, -85.6420), 7),
    
    -- Cross-region Adventures
    ('Multi-District Explorer', 7, 1, POINT(42.9625, -85.6670), 5),
    ('Science and Nature Combo', 8, 8, POINT(42.9570, -85.6340), 4),
    ('Art and History Journey', 9, 7, POINT(42.9460, -85.6785), 4),
    ('Sports and Recreation Tour', 10, 10, POINT(42.9385, -85.6675), 5),
    ('Ultimate Adventure Challenge', 11, 11, POINT(42.9815, -85.7120), 10),
    ('Beginner Friendly Sampler', 12, 12, POINT(42.9230, -85.6450), 3),
    
    -- User Test Data
    -- Test adventures for easy demo use
    ('Quick Test Run', 1, 13, POINT(42.9300, -85.6500), 2),
    ('Demo Adventure', 1, 14, POINT(42.9400, -85.6600), 3),
    ('First Timer Quest', 1, 15, POINT(42.9500, -85.6700), 1),
    ('Simple Practice', 1, 13, POINT(42.9290, -85.6490), 2);

-- Insert Tokens (140+ tokens across all adventures)
-- Adventure 1: Historic Downtown Walking Tour (3 tokens)
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES 
    (1, POINT(42.9628, -85.6675), 'Find the building where city decisions were made for over a century', 1),
    (1, POINT(42.9640, -85.6687), 'Look up to see the timekeeper that has watched over downtown for decades', 2),
    (1, POINT(42.9622, -85.6693), 'Discover where the past comes alive through exhibits and artifacts', 3);

-- Adventure 2: Peaceful River Walk (2 tokens)
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES 
    (2, POINT(42.9710, -85.6578), 'Stand where the water meets the sky for the perfect view', 1),
    (2, POINT(42.9698, -85.6590), 'Quietly observe nature from this elevated wooden platform', 2);

-- Adventure 3: Campus Discovery (3 tokens)
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES 
    (3, POINT(42.9307, -85.5875), 'Knowledge seekers gather here among countless books and resources', 1),
    (3, POINT(42.9319, -85.5887), 'The heart of student life beats strongest in this central building', 2),
    (3, POINT(42.9301, -85.5869), 'Where minds explore the mysteries of the natural world', 3);

-- Adventure 4: Family Forest Fun (2 tokens)
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES 
    (4, POINT(42.9239, -85.6228), 'This mighty giant has stood guard over the forest for generations', 1),
    (4, POINT(42.9251, -85.6240), 'Listen for the sound of cascading water hidden among the trees', 2);

-- Adventure 5: City Center Scavenger Hunt (3 tokens)
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES 
    (5, POINT(42.9610, -85.6551), 'Water dances in the heart of the city where people gather', 1),
    (5, POINT(42.9622, -85.6563), 'Commerce and community come together under one roof', 2),
    (5, POINT(42.9604, -85.6545), 'Where deals are made and the economy thrives', 3);

-- Adventure 6: Lakefront Leisure (2 tokens)
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES 
    (6, POINT(42.9795, -85.6417), 'A beacon of safety guides vessels through the darkness', 1),
    (6, POINT(42.9783, -85.6429), 'Feel the sand between your toes where waves meet the shore', 2);

-- Adventure 7: Heritage Time Travel (4 tokens)
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES 
    (7, POINT(42.9450, -85.6783), 'Where metal was shaped by fire and hammer in days gone by', 1),
    (7, POINT(42.9462, -85.6795), 'Young minds once learned their lessons in this one-room wonder', 2),
    (7, POINT(42.9444, -85.6777), 'Community faith has been nurtured here for generations', 3),
    (7, POINT(42.9456, -85.6789), 'Return to where your journey began in this living history', 4);

-- Adventure 8: Science Explorer Challenge (5 tokens)
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES 
    (8, POINT(42.9561, -85.6339), 'Reach for the stars in this dome of cosmic wonder', 1),
    (8, POINT(42.9573, -85.6351), 'Discover Earth''s ancient secrets preserved for all to see', 2),
    (8, POINT(42.9555, -85.6333), 'Innovation and technology converge in this modern marvel', 3),
    (8, POINT(42.9567, -85.6345), 'Science comes alive through interactive discovery', 4),
    (8, POINT(42.9570, -85.6348), 'Complete your scientific journey where it all began', 5);

-- Adventure 9: Art Appreciation Quest (4 tokens)
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES 
    (9, POINT(42.9672, -85.6506), 'Contemporary creativity flows through these pristine white walls', 1),
    (9, POINT(42.9684, -85.6518), 'Art takes three-dimensional form in this outdoor gallery', 2),
    (9, POINT(42.9666, -85.6500), 'Color and expression explode across this urban canvas', 3),
    (9, POINT(42.9678, -85.6512), 'Artistic inspiration surrounds you in every direction', 4);

-- Adventure 10: Athletic Achievement Hunt (4 tokens)
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES 
    (10, POINT(42.9383, -85.6672), 'Where champions are crowned and crowds roar with excitement', 1),
    (10, POINT(42.9395, -85.6684), 'Love means nothing here, but skill means everything', 2),
    (10, POINT(42.9377, -85.6666), 'Dive into victory in these crystal blue lanes', 3),
    (10, POINT(42.9389, -85.6678), 'Athletic excellence is celebrated throughout this complex', 4);

-- Adventure 11: Garden Paradise Tour (4 tokens)
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES 
    (11, POINT(42.9228, -85.6450), 'Beauty and fragrance bloom in thorny perfection', 1),
    (11, POINT(42.9240, -85.6462), 'Winged rainbows dance among tropical blooms', 2),
    (11, POINT(42.9222, -85.6444), 'Culinary treasures grow in aromatic abundance', 3),
    (11, POINT(42.9234, -85.6456), 'Nature''s artistry is perfectly cultivated here', 4);

-- Adventure 12: Urban Photography Walk (5 tokens)
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES 
    (12, POINT(42.9610, -85.6551), 'Capture the perfect shot of urban water artistry', 1),
    (12, POINT(42.9622, -85.6563), 'Frame the hustle and bustle of commercial life', 2),
    (12, POINT(42.9604, -85.6545), 'Document where business dreams come to life', 3),
    (12, POINT(42.9616, -85.6557), 'Show the energy that pulses through city streets', 4),
    (12, POINT(42.9620, -85.6560), 'Your photographic journey reaches its perfect conclusion', 5);

-- Adventure 13: Mountain Summit Challenge (6 tokens)
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES 
    (13, POINT(42.9812, -85.7123), 'Begin your ascent where the trail meets the sky', 1),
    (13, POINT(42.9815, -85.7120), 'Halfway up, catch your breath and enjoy the growing view', 2),
    (13, POINT(42.9818, -85.7117), 'The world spreads below you from this lofty perch', 3),
    (13, POINT(42.9806, -85.7129), 'Soar with the eagles from this rocky outcrop', 4),
    (13, POINT(42.9824, -85.7105), 'Rest among ancient pines before the final push', 5),
    (13, POINT(42.9821, -85.7114), 'Victory awaits at the summit of your achievement', 6);

-- Adventure 14: Ultimate City Explorer (7 tokens)
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES 
    (14, POINT(42.9628, -85.6675), 'Begin where civic history was written', 1),
    (14, POINT(42.9640, -85.6687), 'Time stands still at this towering landmark', 2),
    (14, POINT(42.9622, -85.6693), 'Dive deep into the stories of yesteryear', 3),
    (14, POINT(42.9634, -85.6681), 'The heart of downtown beats with endless possibility', 4),
    (14, POINT(42.9631, -85.6678), 'Hidden gems await the dedicated explorer', 5),
    (14, POINT(42.9637, -85.6684), 'Urban legends come alive in the shadows of history', 6),
    (14, POINT(42.9625, -85.6688), 'Complete mastery of the city center awaits', 7);

-- Adventure 15: Nature Photography Marathon (6 tokens)
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES 
    (15, POINT(42.9710, -85.6578), 'Frame the perfect reflection in still waters', 1),
    (15, POINT(42.9698, -85.6590), 'Capture wildlife in their natural habitat', 2),
    (15, POINT(42.9716, -85.6572), 'Document where anglers find their peace', 3),
    (15, POINT(42.9704, -85.6584), 'The river''s story unfolds in every ripple', 4),
    (15, POINT(42.9707, -85.6581), 'Nature''s palette changes with the shifting light', 5),
    (15, POINT(42.9701, -85.6587), 'Your portfolio completes with riverside serenity', 6);

-- Continue with more adventures... (tokens 16-24)
-- Adventure 16: Academic Treasure Hunt (6 tokens)
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES 
    (16, POINT(42.9307, -85.5875), 'Knowledge begins in the temple of books', 1),
    (16, POINT(42.9319, -85.5887), 'Student life converges in this bustling hub', 2),
    (16, POINT(42.9301, -85.5869), 'Scientific discovery awaits behind laboratory doors', 3),
    (16, POINT(42.9313, -85.5881), 'Academic excellence is forged on these hallowed grounds', 4),
    (16, POINT(42.9310, -85.5878), 'Hidden histories lie within ivy-covered walls', 5),
    (16, POINT(42.9316, -85.5884), 'Graduation marks the end of this scholarly quest', 6);

-- Adventure 17: Forest Survival Challenge (8 tokens)
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES 
    (17, POINT(42.9239, -85.6228), 'Seek shelter beneath the ancient guardian oak', 1),
    (17, POINT(42.9251, -85.6240), 'Fresh water flows from nature''s hidden spring', 2),
    (17, POINT(42.9233, -85.6222), 'Find your bearings in the forest''s heart', 3),
    (17, POINT(42.9245, -85.6234), 'Survival skills are tested in nature''s classroom', 4),
    (17, POINT(42.9242, -85.6231), 'Forage wisely among the woodland offerings', 5),
    (17, POINT(42.9248, -85.6237), 'Create fire where pioneers once warmed themselves', 6),
    (17, POINT(42.9236, -85.6225), 'Navigate by stars through the forest canopy', 7),
    (17, POINT(42.9254, -85.6243), 'Emerge victorious from the wilderness trial', 8);

-- Adventure 18: Complete Lakefront Adventure (7 tokens)
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES 
    (18, POINT(42.9795, -85.6417), 'Begin where light guides sailors home', 1),
    (18, POINT(42.9783, -85.6429), 'Feel the rhythm of waves on sandy shores', 2),
    (18, POINT(42.9801, -85.6411), 'Where vessels begin their aquatic journeys', 3),
    (18, POINT(42.9789, -85.6423), 'Lakefront beauty stretches beyond the horizon', 4),
    (18, POINT(42.9792, -85.6420), 'Sunset paints the water in golden hues', 5),
    (18, POINT(42.9786, -85.6426), 'Seagulls dance above the gentle swells', 6),
    (18, POINT(42.9798, -85.6414), 'Complete mastery of the waterfront awaits', 7);

-- Continue with remaining adventures (19-24) with similar token patterns...
-- For brevity, I'll add a few more representative examples:

-- Adventure 23: Ultimate Adventure Challenge (10 tokens) - The most difficult
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES 
    (23, POINT(42.9812, -85.7123), 'The ultimate test begins at the mountain base', 1),
    (23, POINT(42.9815, -85.7120), 'Prove your endurance on the climbing trail', 2),
    (23, POINT(42.9818, -85.7117), 'Conquer fear at the summit viewpoint', 3),
    (23, POINT(42.9806, -85.7129), 'Soar above limitations at Eagle Rock', 4),
    (23, POINT(42.9824, -85.7105), 'Find wisdom among the ancient pines', 5),
    (23, POINT(42.9821, -85.7114), 'Push beyond physical limits', 6),
    (23, POINT(42.9809, -85.7126), 'Mental fortitude is tested here', 7),
    (23, POINT(42.9827, -85.7108), 'The spirit of adventure lives in these heights', 8),
    (23, POINT(42.9803, -85.7132), 'Few reach this pinnacle of achievement', 9),
    (23, POINT(42.9830, -85.7102), 'Ultimate victory belongs to the persistent', 10);

-- Adventure 24: Beginner Friendly Sampler (3 tokens)
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES 
    (24, POINT(42.9228, -85.6450), 'Start your adventure journey among the roses', 1),
    (24, POINT(42.9240, -85.6462), 'Wonder at nature''s flying jewels', 2),
    (24, POINT(42.9234, -85.6456), 'Complete your first quest in the garden''s heart', 3);

-- User Test Data
-- Test Adventure Tokens (25-28)
-- Adventure 25: Quick Test Run (2 tokens)
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES 
    (25, POINT(42.9295, -85.6495), 'Find Test Point A - look for the sign!', 1),
    (25, POINT(42.9305, -85.6505), 'You made it to Test Point B - almost done!', 2);

-- Adventure 26: Demo Adventure (3 tokens)
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES 
    (26, POINT(42.9395, -85.6595), 'Welcome to Demo Marker 1 - great start!', 1),
    (26, POINT(42.9405, -85.6605), 'Demo Marker 2 found - you''re doing great!', 2),
    (26, POINT(42.9385, -85.6585), 'Demo Marker 3 complete - adventure finished!', 3);

-- Adventure 27: First Timer Quest (1 token)
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES 
    (27, POINT(42.9495, -85.6695), 'Welcome! This is where all adventures begin!', 1);

-- Adventure 28: Simple Practice (2 tokens)
INSERT INTO Token(adventureID, location, hint, tokenOrder) VALUES 
    (28, POINT(42.9290, -85.6490), 'Practice makes perfect - find this easy spot!', 1),
    (28, POINT(42.9310, -85.6510), 'Great job! You''ve completed the practice run!', 2);

-- Insert Completed Adventures (various completion dates and times)
INSERT INTO CompletedAdventure(adventurerID, adventureID, completionDate, completionTime) VALUES 
    -- User 1 completions
    (1, 2, '2024-10-01', '00:45:30'),
    (1, 4, '2024-10-03', '00:32:15'),
    (1, 6, '2024-10-05', '00:28:45'),
    (1, 24, '2024-10-02', '00:25:10'),
    
    -- User 2 completions
    (2, 1, '2024-10-02', '01:15:20'),
    (2, 3, '2024-10-04', '00:52:30'),
    (2, 5, '2024-10-06', '01:08:15'),
    (2, 7, '2024-10-08', '01:45:50'),
    
    -- User 3 completions
    (3, 8, '2024-10-07', '02:15:30'),
    (3, 9, '2024-10-09', '01:32:45'),
    (3, 10, '2024-10-11', '01:58:20'),
    
    -- User 4 completions
    (4, 11, '2024-10-10', '01:22:10'),
    (4, 12, '2024-10-12', '02:05:35'),
    (4, 24, '2024-10-08', '00:35:50'),
    
    -- User 5 completions
    (5, 13, '2024-10-15', '03:45:20'),
    (5, 14, '2024-10-18', '02:58:45'),
    
    -- User 6 completions
    (6, 15, '2024-10-14', '02:22:10'),
    (6, 16, '2024-10-16', '02:48:30'),
    (6, 18, '2024-10-20', '02:15:45'),
    
    -- User 7 completions
    (7, 1, '2024-10-13', '01:05:25'),
    (7, 19, '2024-10-17', '01:55:40'),
    
    -- User 8 completions
    (8, 20, '2024-10-19', '01:42:15'),
    (8, 21, '2024-10-21', '01:38:50'),
    
    -- User 9 completions
    (9, 22, '2024-10-22', '02:12:30'),
    (9, 24, '2024-10-20', '00:42:20'),
    
    -- User 10 completions
    (10, 23, '2024-10-25', '04:32:15'),
    
    -- Additional completions for testing
    (11, 1, '2024-10-26', '01:12:45'),
    (11, 2, '2024-10-27', '00:48:30'),
    (12, 3, '2024-10-28', '00:58:20'),
    (12, 4, '2024-10-29', '00:41:15'),
    (13, 5, '2024-10-30', '01:18:40'),
    (14, 6, '2024-10-31', '00:52:25'),
    (15, 24, '2024-11-01', '00:38:10'),
    
    -- User Test Data
    -- Test user completions for demo
    (16, 27, '2024-11-27', '00:05:30'),  -- test user completed First Timer Quest
    (16, 25, '2024-11-27', '00:08:15'),  -- demo user completed Quick Test Run
    (16, 28, '2024-11-27', '00:06:45'),  -- user1 completed Simple Practice
    (16, 26, '2024-11-27', '00:12:20');  -- test user also completed Demo Adventure

-- -- Insert Adventures In Progress (users who started but haven't finished adventures)
-- INSERT INTO AdventureInProgress(adventurerID, adventureID, dateStarted, lastUpdated, tokensCollected) VALUES 
--     -- User 1 has started but not completed some adventures
--     (1, 7, '2024-10-28 14:30:00', '2024-10-30 16:45:00', 2),  -- Heritage Time Travel (4 tokens total)
--     (1, 13, '2024-10-30 09:15:00', '2024-11-01 10:30:00', 3), -- Mountain Summit Challenge (6 tokens total)
    
--     -- User 2 in progress
--     (2, 17, '2024-10-29 08:00:00', '2024-10-31 14:20:00', 5), -- Forest Survival Challenge (8 tokens total)
--     (2, 23, '2024-11-01 07:30:00', '2024-11-01 12:45:00', 4), -- Ultimate Adventure Challenge (10 tokens total)
    
--     -- User 3 in progress
--     (3, 18, '2024-10-31 11:00:00', '2024-11-01 15:30:00', 4), -- Complete Lakefront Adventure (7 tokens total)
--     (3, 11, '2024-10-30 16:00:00', '2024-10-31 09:15:00', 3), -- Garden Paradise Tour (4 tokens total)
    
--     -- User 4 in progress
--     (4, 14, '2024-10-27 13:45:00', '2024-10-29 11:20:00', 3), -- Ultimate City Explorer (7 tokens total)
--     (4, 8, '2024-10-31 10:30:00', '2024-11-01 14:15:00', 2),  -- Science Explorer Challenge (5 tokens total)
    
--     -- User 5 in progress
--     (5, 12, '2024-10-28 15:20:00', '2024-10-30 17:45:00', 3), -- Urban Photography Walk (5 tokens total)
    
--     -- User 6 in progress
--     (6, 19, '2024-10-29 12:00:00', '2024-10-31 16:30:00', 2), -- Multi-District Explorer (5 tokens total)
    
--     -- User 7 in progress
--     (7, 9, '2024-10-30 08:45:00', '2024-11-01 11:20:00', 2),  -- Art Appreciation Quest (4 tokens total)
    
--     -- User 8 in progress
--     (8, 15, '2024-10-29 14:15:00', '2024-11-01 09:30:00', 4), -- Nature Photography Marathon (6 tokens total)
    
--     -- User 9 in progress
--     (9, 16, '2024-10-28 11:30:00', '2024-10-30 13:45:00', 2), -- Academic Treasure Hunt (6 tokens total)
    
--     -- User 10 in progress
--     (10, 10, '2024-10-31 09:00:00', '2024-11-01 12:15:00', 1), -- Athletic Achievement Hunt (4 tokens total)
    
--     -- User 11 in progress
--     (11, 20, '2024-10-30 16:45:00', '2024-11-01 08:30:00', 3), -- Science and Nature Combo (4 tokens total)
    
--     -- User 12 in progress (just started)
--     (12, 1, '2024-11-01 13:00:00', '2024-11-01 13:00:00', 0),  -- Historic Downtown Walking Tour (3 tokens total)
    
--     -- User 13 in progress (almost done)
--     (13, 24, '2024-10-29 10:20:00', '2024-10-31 15:50:00', 2), -- Beginner Friendly Sampler (3 tokens total)
    
--     -- User 14 in progress
--     (14, 21, '2024-10-30 07:15:00', '2024-11-01 11:45:00', 2), -- Art and History Journey (4 tokens total)
    
--     -- User 15 in progress
--     (15, 22, '2024-10-31 14:30:00', '2024-11-01 16:20:00', 3); -- Sports and Recreation Tour (5 tokens total)

-- -- Insert Collected Tokens (showing which specific tokens each user has found)
-- INSERT INTO CollectedToken(adventureInProgressID, tokenID, collectedAt) VALUES 
--     -- User 1's Heritage Time Travel progress (Adventure 7, tokens 16-19)
--     (1, 16, '2024-10-28 15:15:00'), -- First token (tokenOrder 1)
--     (1, 17, '2024-10-30 16:30:00'), -- Second token (tokenOrder 2)
    
--     -- User 1's Mountain Summit Challenge progress (Adventure 13, tokens 42-47)
--     (2, 42, '2024-10-30 09:45:00'), -- First token (tokenOrder 1)
--     (2, 43, '2024-10-30 11:20:00'), -- Second token (tokenOrder 2)
--     (2, 44, '2024-11-01 10:15:00'), -- Third token (tokenOrder 3)
    
--     -- User 2's Forest Survival Challenge progress (Adventure 17, tokens 67-74)
--     (3, 67, '2024-10-29 08:30:00'), -- First token (tokenOrder 1)
--     (3, 68, '2024-10-29 10:15:00'), -- Second token (tokenOrder 2)
--     (3, 69, '2024-10-30 09:45:00'), -- Third token (tokenOrder 3)
--     (3, 70, '2024-10-30 12:30:00'), -- Fourth token (tokenOrder 4)
--     (3, 71, '2024-10-31 14:00:00'), -- Fifth token (tokenOrder 5)
    
--     -- User 2's Ultimate Adventure Challenge progress (Adventure 23, tokens 82-91)
--     (4, 82, '2024-11-01 08:00:00'), -- First token (tokenOrder 1)
--     (4, 83, '2024-11-01 09:30:00'), -- Second token (tokenOrder 2)
--     (4, 84, '2024-11-01 11:15:00'), -- Third token (tokenOrder 3)
--     (4, 85, '2024-11-01 12:30:00'), -- Fourth token (tokenOrder 4)
    
--     -- User 3's Complete Lakefront Adventure progress (Adventure 18, tokens 75-81)
--     (5, 75, '2024-10-31 11:30:00'), -- First token (tokenOrder 1)
--     (5, 76, '2024-10-31 13:15:00'), -- Second token (tokenOrder 2)
--     (5, 77, '2024-11-01 10:45:00'), -- Third token (tokenOrder 3)
--     (5, 78, '2024-11-01 15:15:00'), -- Fourth token (tokenOrder 4)
    
--     -- User 3's Garden Paradise Tour progress (Adventure 11, tokens 33-36)
--     (6, 33, '2024-10-30 16:30:00'), -- First token (tokenOrder 1)
--     (6, 34, '2024-10-30 17:45:00'), -- Second token (tokenOrder 2)
--     (6, 35, '2024-10-31 09:00:00'), -- Third token (tokenOrder 3)
    
--     -- User 4's Ultimate City Explorer progress (Adventure 14, tokens 48-54)
--     (7, 48, '2024-10-27 14:15:00'), -- First token (tokenOrder 1)
--     (7, 49, '2024-10-28 10:30:00'), -- Second token (tokenOrder 2)
--     (7, 50, '2024-10-29 11:00:00'), -- Third token (tokenOrder 3)
    
--     -- User 4's Science Explorer Challenge progress (Adventure 8, tokens 20-24)
--     (8, 20, '2024-10-31 11:00:00'), -- First token (tokenOrder 1)
--     (8, 21, '2024-11-01 14:00:00'), -- Second token (tokenOrder 2)
    
--     -- User 5's Urban Photography Walk progress (Adventure 12, tokens 37-41)
--     (9, 37, '2024-10-28 15:45:00'), -- First token (tokenOrder 1)
--     (9, 38, '2024-10-29 11:30:00'), -- Second token (tokenOrder 2)
--     (9, 39, '2024-10-30 17:30:00'), -- Third token (tokenOrder 3)
    
--     -- User 7's Art Appreciation Quest progress (Adventure 9, tokens 25-28)
--     (11, 25, '2024-10-30 09:15:00'), -- First token (tokenOrder 1)
--     (11, 26, '2024-11-01 11:00:00'), -- Second token (tokenOrder 2)
    
--     -- User 8's Nature Photography Marathon progress (Adventure 15, tokens 55-60)
--     (12, 55, '2024-10-29 14:45:00'), -- First token (tokenOrder 1)
--     (12, 56, '2024-10-30 10:20:00'), -- Second token (tokenOrder 2)
--     (12, 57, '2024-10-31 13:15:00'), -- Third token (tokenOrder 3)
--     (12, 58, '2024-11-01 09:15:00'), -- Fourth token (tokenOrder 4)
    
--     -- User 9's Academic Treasure Hunt progress (Adventure 16, tokens 61-66)
--     (13, 61, '2024-10-28 12:00:00'), -- First token (tokenOrder 1)
--     (13, 62, '2024-10-30 13:30:00'), -- Second token (tokenOrder 2)
    
--     -- User 10's Athletic Achievement Hunt progress (Adventure 10, tokens 29-32)
--     (14, 29, '2024-10-31 09:30:00'), -- First token (tokenOrder 1)
    
--     -- User 13's Beginner Friendly Sampler progress (Adventure 24, tokens 92-94)
--     (17, 92, '2024-10-29 10:45:00'), -- First token (tokenOrder 1)
--     (17, 93, '2024-10-31 15:30:00'), -- Second token (tokenOrder 2)
    
--     -- Some users collecting tokens out of order (realistic scenario)
--     (3, 73, '2024-10-31 16:00:00'), -- User 2 found token 7 before token 6 in Forest Survival
--     (5, 80, '2024-11-01 14:30:00'), -- User 3 found token 6 before token 5 in Lakefront Adventure
--     (12, 60, '2024-11-01 08:45:00'); -- User 8 found token 6 before token 5 in Nature Photography

-- Summary Statistics
-- Total Adventurers: 15
-- Total Regions: 12  
-- Total Landmarks: 36 (3 per region)
-- Total Adventures: 24 (6 easy, 6 medium, 6 hard, 6 cross-region)
-- Total Tokens: 94 (distributed across adventures: 2-10 tokens each)
-- Total Completed Adventures: 27 completion records
-- Total Adventures In Progress: 19 (across 15 different users)
-- Total Collected Tokens: 33 (showing partial progress through adventures)

-- Data Coverage:
-- - Easy Adventures (2-3 tokens): Historic Downtown, River Walk, Campus, Forest, City Center, Lakefront
-- - Medium Adventures (4-5 tokens): Heritage, Science, Art, Athletic, Garden, Photography  
-- - Hard Adventures (6+ tokens): Mountain Summit, City Explorer, Nature Marathon, Academic Hunt, Forest Survival, Complete Lakefront
-- - Ultimate Challenge (10 tokens): Most difficult adventure with extensive progression tracking

-- Adventure Progress Examples:
-- - Users with multiple adventures in progress (some users have 2-3 active adventures)
-- - Various completion percentages (0% to 75% complete)
-- - Recent activity (last updated within past few days)
-- - Tokens collected out of order (realistic GPS-based user behavior)
-- - Mix of all difficulty levels represented in progress data

SELECT 'Mock data insertion completed successfully!' AS status;