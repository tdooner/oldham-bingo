var BOARD_ROWS = 5,
    BOARD_COLS = 5,
    FREE_SPACE_INDEX = 12;
var Players = new Meteor.Collection("players");
var Squares = new Meteor.Collection("squares");
var Games = new Meteor.Collection("games");
var Chats = new Meteor.Collection("chats");

if (Meteor.isClient) {

  var joinCurrentGame = function(username) {
    var current_game = Games.findOne({ active: true });
    var userid = Players.insert({
      username: username,
      acquired_squares: [],
      victory: false,
      game_id: current_game._id,
    });
    Session.set("userid", userid);
    Session.set("gameid", current_game._id);

    // Collect 24 random squares and mix them up. Store them in session for
    // now.
    Session.set('board', shuffle(Squares.find({}).fetch()).slice(0,25));
  };

  Template.homepage.not_signed_in = function () {
    return !Session.get("username");
  };

  Template.homepage.winner = function() {
    return Players.findOne({ game_id: Session.get("gameid"), victory: true });
  };

  Template.homepage.events({
    'click #new-game-button': function(e) {
      joinCurrentGame(Session.get('username'));
    },
  });

  Template.signin.events({
    'blur #signin_username, click #signin_button': function(e) {
      var username = $(e.target).siblings('#signin_username').val();
      if (username.length === 0) {
        return false;
      }
      Session.set("username", username);
      joinCurrentGame(username);
      return false;
    },
  });

  Template.scoreboard.players = function() {
    return Players.find({
      'game_id': Session.get("gameid"),
    }).map(function(p) {
      p.num_squares = p.acquired_squares.length;
      var acquisitions = Session.get('board').map(function(e) {
        return (p.acquired_squares.indexOf(e._id) != -1);
      });
      p.num_bingo = 5-bingo_count(acquisitions, FREE_SPACE_INDEX);
      return p;
    });
  };

  Template.chat.messages = function() {
    var messages = Chats.find({}, { sort: { timestamp: 1 }}).fetch();
    return messages.slice(messages.length - 10, messages.length).reverse();
  };

  Template.chat.events({
    'click #chat_message_submit': function(e) {
      var $message_holder = $(e.target).siblings('#chat_message');
      message_contents = $message_holder.val();
      $message_holder.val('');
      if (message_contents.length == 0) { return; }
      Chats.insert({ msg: message_contents, timestamp: new Date(), user: Session.get('username') });
      return false;
    },
  });

  Template.board.rows = function() {
    var s = Session.get('board');
    var board = [];
    var player = Players.findOne({ _id: Session.get("userid") });
    if (player === undefined) {
      return board;
    }
    var acquired_squares = player.acquired_squares;
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
      var game;
      if ((game = Games.findOne({ _id: Session.get('gameid') })) && game.active === false) {
        return;
      }
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
      if (bingo_count(acquisitions, FREE_SPACE_INDEX)===5) {
        Players.update({ _id: Session.get("userid") }, {$set: {victory: true}});
				Games.update({_id: Session.get("gameid") }, {$set: {active: false}});
    		Games.insert({ started: new Date(), active: true });
        if ((new Audio()).canPlayType("audio/ogg")) {
          (new Audio('bingo.ogg')).play();
        } else {
          (new Audio('bingo.mp3')).play();
        }
      }
    },
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    var board = [
      { text: "Curly Brackets", },
      { text: "Java", },
      { text: "Boo-lee-an", },
      { text: "Girlfriend", },
      { text: "Talking about old technology", },
      { text: "Impressed by newfangled technology", },
      { text: "32-bit", },
      { text: "Rockwell Automation / PLC5",  },
      { text: "NASA", },
      { text: "Navy / Submarine / Military", },
      { text: "SPACE!!",  },
      { text: "Student falls asleep",  },
      { text: "All four boards have code on them",  },
      { text: "In C...", },
      { text: "PIC Architecture", },
      { text: "Memory Register / Hunks of Memory", },
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
      { text: "Fails at his own problems." },
      { text: "Says 'code' more than three times in one sentence." },
      { text: "C S H F S" },
      { text: "Erases something just after explaining it" },
      { text: "Not that realistic real-world tie-in to what he's teaching" },
      { text: "Talks about code he has written in the distant past" },
      { text: "Global Variables" },
      { text: "Mentions something that would be quite bad without mentioning how/why it is bad" },
      { text: "'You guys'" },
      { text: "Cameron knows more about computers/C than Oldham" },
      { text: "So what does this look like...?" },
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

bingo_count = function(acquired, free_space_index) {
  // Acquired is a flattened array of [ true, true, false, ..., false ]
  acquired[free_space_index] = true;
  long_bingo = 0;
  // Up-down bingo
  for (var i = 0; i < BOARD_COLS; i++) { // column
    inner_long_bingo=0;
    for (var j = 0; j < BOARD_ROWS; j++) { // row
      if (acquired[i + BOARD_COLS * j]) {
        inner_long_bingo += 1;
      }
    }
    if (inner_long_bingo > long_bingo) {
      long_bingo = inner_long_bingo;
    }
  }

  // Left-right bingo
  for (var i = 0; i < BOARD_ROWS; i++) { // row
    inner_long_bingo=0;
    for (var j = 0; j < BOARD_COLS; j++) { // col
      if (acquired[i * BOARD_COLS + j]) {
        inner_long_bingo += 1;
      }
    }
    if (inner_long_bingo > long_bingo) {
      long_bingo = inner_long_bingo;
    }
  }

  // Diagonal Bingo
  // TopLeft-BottomRight
  inner_long_bingo=0;
  for (var i = 0; i < (BOARD_ROWS * BOARD_COLS); i += (BOARD_COLS + 1)) {
    if(acquired[i]) {
      inner_long_bingo += 1;
    }
  }
  if (inner_long_bingo > long_bingo) {
    long_bingo = inner_long_bingo;
  }
  // TopRight-BottomLeft
  inner_long_bingo=0;
  for (var i = (BOARD_ROWS - 1); i < (1 + BOARD_COLS * (BOARD_ROWS - 1)); i += (BOARD_COLS - 1)) {
    if(acquired[i]) {
      inner_long_bingo += 1;
    }
  }
  if (inner_long_bingo > long_bingo) {
    long_bingo = inner_long_bingo;
  }
  return long_bingo;
}
