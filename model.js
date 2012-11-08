var BOARD_ROWS = 5,
    BOARD_COLS = 5,
    FREE_SPACE_INDEX = 12;
Players = new Meteor.Collection("players");
Squares = new Meteor.Collection("squares");
Games = new Meteor.Collection("games");
Chats = new Meteor.Collection("chats");

if (Meteor.isServer) {
  Meteor.publish('players', function () {
    return Players.find();
  });

  Meteor.publish('games', function () {
    return Games.find();
  });

  Meteor.publish('squares', function () {
    return Squares.find();
  });

  Meteor.publish('chats', function () {
    return Chats.find();
  });
}
