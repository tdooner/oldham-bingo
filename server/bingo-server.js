Meteor.methods({
  insert_chat: function(message_contents, user) {
    Chats.insert({ msg: message_contents, timestamp: new Date(), user: user });
  },
});

Meteor.startup(function () {
  var board = [
{ text: "Curly Brackets", },
{ text: "Java", },
{ text: "Boo-lee-an", },
{ text: "Girlfriend", },
{ text: "Talking about old technology", },
{ text: "Impressed by newfangled technology", },
{ text: "32-bit", },
{ text: "Rockwell Automation",  },
{ text: "NASA", },
{ text: "Navy/Submarine", },
{ text: "SPACE!!",  },
{ text: "Student falls asleep",  },
{ text: "All four boards have code on them",  },
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
{ text: "Fails at his own problems." },
  ];
Squares.remove({});
for (i in board) {
  Squares.insert(board[i]);
};
Games.remove({});
Games.insert({ started: new Date(), active: true })
  });
