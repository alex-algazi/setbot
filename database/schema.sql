CREATE TABLE Players ( 
	PlayerUID            integer NOT NULL  PRIMARY KEY AUTOINCREMENT ,
	PlayerName           varchar(37) NOT NULL    
 );

CREATE TABLE ServersPlayers ( 
	ServerID             integer NOT NULL    ,
	PlayerUID            integer NOT NULL    ,
	FOREIGN KEY ( PlayerUID ) REFERENCES Players( PlayerUID )  
 );

CREATE TABLE Games ( 
	GameUID              integer NOT NULL  PRIMARY KEY AUTOINCREMENT ,
	ServerID             integer NOT NULL    ,
	Cancelled            integer NOT NULL    ,
	GameStart            timestamp NOT NULL    ,
	GameEnd              timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
 );

CREATE TABLE PlayersGames ( 
	PlayerUID            integer NOT NULL    ,
	GameUID              integer NOT NULL    ,
	Score                integer NOT NULL    ,
	FOREIGN KEY ( GameUID ) REFERENCES Games( GameUID )  ,
	FOREIGN KEY ( PlayerUID ) REFERENCES Players( PlayerUID )  
 );

CREATE UNIQUE INDEX unq_Players ON Players ( PlayerName );
