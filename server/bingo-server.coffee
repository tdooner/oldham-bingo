Meteor.methods
  insert_chat: (message_contents, user) ->
    Chats.insert
      msg: message_contents
      timestamp: new Date()
      user: user

Meteor.startup ->
  oldham_board = [
    "Curly Brackets"
    "Java"
    "Boo-lee-an"
    "Talking about old technology"
    "Impressed by newfangled technology"
    "32-bit"
    "Rockwell Automation"
    "NASA"
    "Navy/Submarine"
    "Student falls asleep"
    "All four boards have code on them"
    "In C..."
    "PIC"
    "Pointers"
    "Memory Hierarchy - Compilers Suck Holy Fucking Shit"
    "Registers"
    "[jibberish]... and that's how that works"
    "Asks question to class - recieves no answer"
    "When your boss asks you to..."
    "A random story tangent"
    "Sem-uh-colon"
    "The Compiler Diagram"
    "This usually is on the test"
    "I once made a program..."
    "malloc/free"
    "Embedded Systems"
    "Memory Management"
    "No one in class is paying attention"
    "Reading code without explaining it"
    "Blackboard full of PIC assembly"
    "This is how you do the homework"
    "Extra Credit"
    "When I was an undergrad..."
    "We're running out of time..."
    "Fills board with unreadable handwriting"
    "Student calls out a mistake"
    "Confused by his own notes"
    "Link List ALL the data structures!"
    "Quads"
    "Student walks in more than thirty minutes late."
    "Student walks in, turns in homework, and leaves."
  ].map (s) ->
    {text: s, board: "oldham"}
  standard_board = [1..75].map (n) ->
    a = {}
    a['letter'] = ["B", "I", "N", "G", "O"][Math.floor((n-1)/15)]
    a['text'] = "#{a.letter}#{n}"
    a['board'] = "standard"
    a
  boards = [oldham_board, standard_board]
  Squares.remove {}
  for board in boards
    for square in board
      Squares.insert square
  Games.remove {}
