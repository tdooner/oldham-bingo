var BOARD_ROWS = 5,
    BOARD_COLS = 5,
    FREE_SPACE_INDEX = 12;
var Players = new Meteor.Collection("players");
var Squares = new Meteor.Collection("squares");
var Games = new Meteor.Collection("games");

if (Meteor.isClient) {
  Template.homepage.signed_in = function () {
    return !Session.get("username");
  };

  Template.homepage.winner = function() {
    return Players.findOne({ game_id: Session.get("gameid"), victory: true });
  };

  Template.signin.events({
    'blur #signin_username': function(e) {
      var current_game = Games.findOne({ active: true })
      var username = e.target.value;
      var userid = Players.insert({
        username: username,
        acquired_squares: [],
        victory: false,
        game_id: current_game._id,
      });
      Session.set("username", username);
      Session.set("userid", userid);
      Session.set("gameid", current_game._id);

      // Collect 24 random squares and mix them up. Store them in session for
      // now.
      if (Session.get('board') === undefined) {
        Session.set('board', shuffle(Squares.find({}).fetch()).slice(0,25));
      }
    },
  });

  Template.scoreboard.players = function() {
    return Players.find({
      'game_id': Session.get("gameid"),
    }).map(function(p) {
      p.num_squares = p.acquired_squares.length;
      return p;
    });
  };

  Template.board.rows = function() {
    var s = Session.get('board');
    var board = [];
    var acquired_squares = Players.findOne({ _id: Session.get("userid") }).acquired_squares;
    for (var i = 0; i < BOARD_ROWS; i++) {
      var this_row = [];
      for (var j = 0; j < BOARD_COLS; j++) {
        if (i * BOARD_ROWS + j != FREE_SPACE_INDEX) {
          var square = s[i * BOARD_ROWS + j];
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

      // Prepare for the Is-it-bingo? check
      var acquired_squares = Players.find({ _id: Session.get("userid") }).fetch()[0].acquired_squares;
      var acquisitions = Session.get('board').map(function(e) {
        return (acquired_squares.indexOf(e._id) != -1);
      });
      // Check for Bingo, update player accordingly.
      if (has_bingo(acquisitions, FREE_SPACE_INDEX)) {
        Players.update({ _id: Session.get("userid") }, {$set: {victory: true}})
      }
    },
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    var board = [
      { text: "Curly Brackets", },
      { text: "Abstraction", },
      { text: "Convert to Java", },
      { text: "How Compilers Work", },
      { text: "Boo-lee-an", },
      { text: "Girlfriend", },
      { text: "Talking about old technology", },
      { text: "Impressed by newfangled technology", },
      { text: "32-bit", },
      { text: "Rockwell Automation",  },
      { text: "NASA", },
      { text: "Navy/Submarine", },
      { text: "Space Shuttle",  },
      { text: "In C...", },
      { text: "PIC Architecture", },
      { text: "Memory Register", },
      { text: "[jibberish]... and that's how that works", },
      { text: "Asks question to class - recieves no answer", },
      { text: "When your boss asks you to...", },
      { text: "A random story", },
      { text: "Sem-uh-colon" },
      { text: "Cats" },
      { text: "The Compiler Diagram" },
      { text: "Abstraction" },
      { text: "This usually is on the test" },
      { text: "The Oldham laugh" },
      { text: "This is how you do the homework" },
      { text: "Extra Credit" },
      { text: "EECS 281" },
      { text: "Running out of time" },
      { text: "Fills board with unreadable handwriting" },
      { text: "Student calls out a mistake" },
    ];
    Squares.remove({});
    for (i in board) {
      Squares.insert(board[i]);
    };
    Games.remove({});
    Games.insert({ started: new Date(), active: true })
  });
}
//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]

shuffle = function(o){ //v1.0
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

has_bingo = function(acquired, free_space_index) {
  // Acquired is a flattened array of [ true, true, false, ..., false ]
  acquired[free_space_index] = true;

  // Up-down bingo
  for (var i = 0; i < BOARD_COLS; i++) { // column
    var has_bingo = true;
    for (var j = 0; j < BOARD_ROWS; j++) { // row
      has_bingo = has_bingo && acquired[i + BOARD_COLS * j];
    }
    if (has_bingo) {
      return true;
    }
  }

  // Left-right bingo
  for (var i = 0; i < BOARD_ROWS; i++) { // row
    var has_bingo = true;
    for (var j = 0; j < BOARD_COLS; j++) { // col
      has_bingo = has_bingo && acquired[i * BOARD_COLS + j];
    }
    if (has_bingo) {
      return true;
    }
  }

  // Diagonal Bingo
  // TopLeft-BottomRight
  var has_bingo = true;
  for (var i = 0; i < (BOARD_ROWS * BOARD_COLS); i += (BOARD_COLS + 1)) {
    has_bingo = has_bingo && acquired[i];
  }
  if (has_bingo) {
    return true;
  }
  // TopRight-BottomLeft
  var has_bingo = true;
  for (var i = (BOARD_ROWS - 1); i < (1 + BOARD_COLS * (BOARD_ROWS - 1)); i += (BOARD_COLS - 1)) {
    has_bingo = has_bingo && acquired[i];
  }
  if (has_bingo) {
    return true;
  }
  return false;
}
