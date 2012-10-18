var Players = new Meteor.Collection("players");
var Squares = new Meteor.Collection("squares");

if (Meteor.isClient) {
  Template.homepage.signed_in = function () {
    return !Session.get("username");
  };
  Template.signin.events({
    'blur #signin_username': function(e) {
      var username = e.target.value;
      var userid = Players.insert({ username: username, started: new Date(), acquired_squares: [] });
      Session.set("username", username);
      Session.set("userid", userid);
    },
  });
  Template.scoreboard.players = function() {
    return Players.find({
      'started': { $gt : (new Date()) - (24 * 60 * 60 * 1000) }
    }).map(function(p) {
      p.num_squares = p.acquired_squares.length;
      return p;
    });
  };

  Template.board.rows = function() {
    if (Session.get('board') === undefined) {
      // Collect 24 random squares and mix them up. Store them in session for
      // now.
      Session.set('board', shuffle(Squares.find({}).fetch()).slice(0,25));
      console.log(Session.get('board'));
    }
    var s = Session.get('board');
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
      var square_id = e.target.id;
      var acquired_squares = Players.find({ _id: Session.get("userid") }).fetch()[0].acquired_squares;
      // todo: verify that the square is not already acquired
      if (acquired_squares.indexOf(square_id) == -1) {
        Players.update({ _id: Session.get("userid") }, {
          $addToSet: { acquired_squares: square_id },
        });
      } else {
        Players.update({ _id: Session.get("userid") }, {
          $pull: { acquired_squares: square_id },
        });
      }
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
//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]

shuffle = function(o){ //v1.0
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};
