var Players = new Meteor.Collection("players");
var Squares = new Meteor.Collection("squares");

if (Meteor.isClient) {
  Template.homepage.signed_in = function () {
    return !Session.get("username");
  };
  Template.signin.events({
    'blur #signin_username': function(e) {
      var username = e.target.value;
      var userid = Players.insert({ username: username, started: new Date(), num_squares: 1, acquired_squares: [] });
      Session.set("username", username);
      Session.set("userid", userid);
    },
  });
  Template.scoreboard.players = function() {
    return Players.find({ 'started': { $gt : (new Date()) - (24 * 60 * 60 * 1000) }});
  };

  Template.board.rows = function() {
    var s = Squares.find({}).fetch();
    var board = [];
    var rows = 5, cols = 5, free_space_index = 12;
    var acquired_squares = Players.find({ _id: Session.get("userid") }).fetch()[0].acquired_squares;
    for (var i = 0; i < rows; i++) {
      var this_row = [];
      for (var j = 0; j < cols; j++) {
        if (i * rows + j != free_space_index) {
          var square = s[i * rows + j];
          if (square) {
            this_row.push({text: square.text, acquired: acquired_squares.indexOf(square._id) != -1, id: square._id});
          }
        } else {
          this_row.push({text: "FREE", acquired: true, id: 'free'});
        }
      } 
      board.push({ cols: this_row });
    }

    return board;
  };

  Template.board.events({ 
    'click td' : function(e) {
      Players.update({ _id: Session.get("userid") }, { 
        $inc: { num_squares: 1 }, 
        $push: { acquired_squares: e.target.id }
      });
    },
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    var board = [
      { text:"Curly Brackets", },
      { text:"Abstraction", },
      { text:"Convert to Java", },
      { text:"How Compilers Work", },
      { text:"I don't draw flow charts, I use them", },
      { text:"Boo-lee-an", },
      { text:"32-bit", },
      { text:"When I was at Rockwell Automation",  },
      { text:"NASA", },
      { text:"In C...", },
      { text:"PLC", },
      { text:"Memory Register", },
      { text:"3.1415926535... I don't know the rest, but...", },
      { text:"Jibberish... and that's how that works", },
      { text:"Asks question to class - recieves no answer", },
      { text:"Java is like C++", },
      { text:"Reference to program on space shuttle",  },
      { text:"When your boss asks you to...", },
      { text:"Hexadecimal" },
    ];
    Squares.remove({});
    for (i in board) {
      Squares.insert(board[i]);
    }
  });
}
