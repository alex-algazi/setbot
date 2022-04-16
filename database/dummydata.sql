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
INSERT INTO ServersPlayers(ServerID, PlayerUID) VALUES (692837831982448760, 1);
INSERT INTO ServersPlayers(ServerID, PlayerUID) VALUES (692837831982448760, 5);

INSERT INTO Games(ServerID, Cancelled, GameStart, GameEnd) VALUES (916467574915625020, 0, '2022-01-01 00:00:00.000', '2022-01-01 18:00:01.000');
INSERT INTO Games(ServerID, Cancelled, GameStart, GameEnd) VALUES (916467574915625020, 1, '2022-01-02 00:00:00.000', '2022-01-02 00:03:01.000');
INSERT INTO Games(ServerID, Cancelled, GameStart, GameEnd) VALUES (916467574915625020, 0, '2022-01-03 00:00:00.000', '2022-01-03 04:00:01.000');
INSERT INTO Games(ServerID, Cancelled, GameStart, GameEnd) VALUES (916467574915625020, 0, '2022-01-04 00:00:00.000', '2022-01-04 00:30:01.000');
INSERT INTO Games(ServerID, Cancelled, GameStart, GameEnd) VALUES (916467574915625020, 1, '2022-01-05 00:00:00.000', '2022-01-05 00:00:30.100');
INSERT INTO Games(ServerID, Cancelled, GameStart, GameEnd) VALUES (692837831982448760, 0, '2022-01-06 00:00:00.000', '2022-01-06 01:00:01.000');

INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (1, 1, 23);
INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (2, 1, 2);
INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (1, 2, 5);
INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (1, 2, 0);
INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (1, 3, 3);
INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (2, 3, 5);
INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (3, 3, 8);
INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (5, 3, 8);
INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (1, 4, 9);
INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (3, 4, 6);
INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (4, 4, 10);
INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (1, 5, 0);
INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (1, 6, 10);
INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES (5, 6, 13);
