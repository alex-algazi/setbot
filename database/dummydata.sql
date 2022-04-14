INSERT INTO Players(PlayerName) VALUES ('kami#4932');
INSERT INTO Players(PlayerName) VALUES ('Lil Smudge#4494');
INSERT INTO Players(PlayerName) VALUES ('Sydyk#8591');
INSERT INTO Players(PlayerName) VALUES ('DrMarcus#5286');
INSERT INTO Players(PlayerName) VALUES ('DMoney#4744');

INSERT INTO ServersPlayers(ServerID, PlayerUID) VALUES (916467574915625020, 1);
INSERT INTO ServersPlayers(ServerID, PlayerUID) VALUES (916467574915625020, 2);
INSERT INTO ServersPlayers(ServerID, PlayerUID) VALUES (916467574915625020, 3);
INSERT INTO ServersPlayers(ServerID, PlayerUID) VALUES (916467574915625020, 4);
INSERT INTO ServersPlayers(ServerID, PlayerUID) VALUES (916467574915625020, 5);

INSERT INTO Games(ServerID, Cancelled, GameStart) VALUES (916467574915625020, 0, DATE('now','-18 hours'));
INSERT INTO Games(ServerID, Cancelled, GameStart) VALUES (916467574915625020, 1, DATE('now','-3 minutes'));
INSERT INTO Games(ServerID, Cancelled, GameStart) VALUES (916467574915625020, 0, DATE('now','-4 hours'));
INSERT INTO Games(ServerID, Cancelled, GameStart) VALUES (916467574915625020, 0, DATE('now','-30 minutes'));
INSERT INTO Games(ServerID, Cancelled, GameStart) VALUES (916467574915625020, 1, DATE('now','-30 seconds'));

INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (1, 1, 23);
INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (2, 1, 2);
INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (1, 2, 5);
INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (1, 2, 0);
INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (1, 3, 4);
INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (2, 3, 5);
INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (3, 3, 7);
INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (5, 3, 8);
INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (1, 4, 9);
INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (3, 4, 6);
INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (4, 4, 10);
INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (1, 5, 0);
