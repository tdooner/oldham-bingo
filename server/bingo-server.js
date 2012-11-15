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
{ text: "Talking about old technology", },
{ text: "Impressed by newfangled technology", },
{ text: "32-bit", },
{ text: "Rockwell Automation",  },
{ text: "NASA", },
{ text: "Navy/Submarine/Military", },
{ text: "Student falls asleep",  },
{ text: "All four boards have code on them",  },
{ text: "In C...", },
{ text: "PIC", },
{ text: "Pointers", },
{ text: "Memory Hierarchy - Compilers Suck Holy Fucking Shit", },
{ text: "Registers", },
{ text: "[jibberish]... and that's how that works", },
{ text: "Asks question to class - recieves no answer", },
{ text: "When your boss asks you to...", },
{ text: "A random story tangent", },
{ text: "Sem-uh-colon" },
{ text: "The Compiler Diagram" },
{ text: "This usually is on the test" },
{ text: "I once made a program..." },
{ text: "malloc/free" },
{ text: "Embedded Systems" },
{ text: "Memory Management" },
{ text: "No one in class is paying attention" },
{ text: "Reading code without explaining it" },
{ text: "Blackboard full of PIC assembly" },
{ text: "This is how you do the homework" },
{ text: "Extra Credit" },
{ text: "When I was an undergrad..." },
{ text: "We're running out of time..." },
{ text: "Fills board with unreadable handwriting" },
{ text: "Student calls out a mistake" },
{ text: "Confused by his own notes" },
{ text: "Link List ALL the data structures!" },
{ text: "Quads" }
{ text: "Student walks in more than thirty minutes late." },
{ text: "Student walks in, turns in homework, and leaves." },
      	];
Squares.remove({});
for (i in board) {
  Squares.insert(board[i]);
};
Games.remove({});
Games.insert({ started: new Date(), active: true })
  });
