joinCurrentGame = (username, game) ->
  current_game = Games.findOne(active: true, game: game)
  unless current_game
    game_id = Games.insert
      started: new Date()
      active: true
      game: game
  else
    game_id = current_game._id

  userid = Players.insert(
    username: username
    acquired_squares: []
    victory: false
    game_id: game_id
    timestamp: Date.now()
  )
  Session.set "userid", userid
  Session.set "gameid", game_id

  # Collect 24 random squares and mix them up. Store them in session for
  # now.
  if Session.get("game") == "oldham"
    Session.set "board", shuffle(Squares.find({board: "oldham"}).fetch()).slice(0, 25)
  else if Session.get("game") == "vincenzo"
    Session.set "board", shuffle(Squares.find({board: "vincenzo"}).fetch()).slice(0, 25)
  else if Session.get("game") == "tekin"
    Session.set "board", shuffle(Squares.find({board: "tekin"}).fetch()).slice(0,25)
  else if Session.get("game") == "standard"
    b = shuffle(Squares.find({letter: "B", board: "standard"}).fetch())[0..4]
    i = shuffle(Squares.find({letter: "I", board: "standard"}).fetch())[0..4]
    n = shuffle(Squares.find({letter: "N", board: "standard"}).fetch())[0..4]
    g = shuffle(Squares.find({letter: "G", board: "standard"}).fetch())[0..4]
    o = shuffle(Squares.find({letter: "O", board: "standard"}).fetch())[0..4]
    separated = [b,i,n,g,o]
    board = new Array(25)
    for i in [0..24]
      board[i] = separated[i%5][Math.floor(i/5)]
    Session.set "board", board

IdlePlayerCheck = ->
  Players.update({_id: Session.get("userid")}, {$set: {timestamp: Date.now()}})

setInterval(IdlePlayerCheck, 10000)

Template.homepage.not_signed_in = ->
  not Session.get("username")

Template.homepage.winner = ->
  Players.findOne
    game_id: Session.get("gameid")
    victory: true

Template.homepage.events "click #new-game-button": (e) ->
  joinCurrentGame Session.get("username"), Session.get("game")

Template.signin.events "click #signin_button": (e) ->
  username = $("#signin_username").val()
  game = $("#game_select option:selected").val()
  if username.length is 0 or username.length > 30
    alert("Please enter a username between 1 and 30 characters!")
    return false

  Session.set "username", username
  Session.set "game", game
  joinCurrentGame username, game
  false

Template.scoreboard.players = ->
  Players.find(game_id: Session.get("gameid")).map (p) ->
    p.num_squares = p.acquired_squares.length
    acquisitions = Session.get("board").map((e) ->
      p.acquired_squares.indexOf(e._id) isnt -1
    )
    p.num_bingo = 5 - bingo_count(acquisitions, FREE_SPACE_INDEX)
    p


Template.chat.messages = ->
  messages = Chats.find({},
    sort:
      timestamp: -1
  ).map((c) ->
    c.time = new Date(c.timestamp)
    c
  )
  messages[0..50]

Template.chat.events "click #chat_message_submit": (e) ->
  $message_holder = $(e.target).siblings("#chat_message")
  message_contents = $message_holder.val()
  $message_holder.val ""
  return  if message_contents.length is 0
  Meteor.call "insert_chat", message_contents, Session.get("username")
  false

Template.board.rows = ->
  s = Session.get("board")
  board = []
  player = Players.findOne(_id: Session.get("userid"))
  return board  if player is `undefined`
  acquired_squares = player.acquired_squares
  i = 0

  while i < BOARD_ROWS
    this_row = []
    j = 0

    while j < BOARD_COLS
      unless i * BOARD_ROWS + j is FREE_SPACE_INDEX
        square = s[i * BOARD_ROWS + j]
        if square
          this_row.push
            text: square.text
            acquired: acquired_squares.indexOf(square._id) isnt -1
            id: square._id

      else
        this_row.push
          text: "FREE"
          acquired: true
          id: "free"

      j++
    board.push cols: this_row
    i++
  board

Template.board.events "click td": (e) ->
  return  if (game = Games.findOne(_id: Session.get("gameid"))) and game.active is false
  square_id = e.target.id
  acquired_squares = Players.find(_id: Session.get("userid")).fetch()[0].acquired_squares

  # todo: verify that the square is not already acquired
  if acquired_squares.indexOf(square_id) is -1
    Players.update
      _id: Session.get("userid")
    ,
      $addToSet:
        acquired_squares: square_id

  else
    Players.update
      _id: Session.get("userid")
    ,
      $pull:
        acquired_squares: square_id


  # Prepare for the Is-it-bingo? check
  acquired_squares = Players.find(_id: Session.get("userid")).fetch()[0].acquired_squares
  acquisitions = Session.get("board").map((e) ->
    acquired_squares.indexOf(e._id) isnt -1
  )

  # Check for Bingo, update player accordingly.
  if bingo_count(acquisitions, FREE_SPACE_INDEX) is 5
    Players.update
      _id: Session.get("userid")
    ,
      $set:
        victory: true

    Games.update
      _id: Session.get("gameid")
    ,
      $set:
        active: false

    if (new Audio()).canPlayType("audio/ogg")
      (new Audio("bingo.ogg")).play()
    else
      (new Audio("bingo.mp3")).play()

shuffle = (o) -> #v1.0
  j = undefined
  x = undefined
  i = o.length

  while i
    j = parseInt(Math.random() * i)
    x = o[--i]
    o[i] = o[j]
    o[j] = x
  o

bingo_count = (acquired, free_space_index) ->

  # Acquired is a flattened array of [ true, true, false, ..., false ]
  acquired[free_space_index] = true
  long_bingo = 0

  # Up-down bingo
  i = 0 # column

  while i < BOARD_COLS
    inner_long_bingo = 0
    j = 0 # row

    while j < BOARD_ROWS
      inner_long_bingo += 1  if acquired[i + BOARD_COLS * j]
      j++
    long_bingo = inner_long_bingo  if inner_long_bingo > long_bingo
    i++

  # Left-right bingo
  i = 0 # row

  while i < BOARD_ROWS
    inner_long_bingo = 0
    j = 0 # col

    while j < BOARD_COLS
      inner_long_bingo += 1  if acquired[i * BOARD_COLS + j]
      j++
    long_bingo = inner_long_bingo  if inner_long_bingo > long_bingo
    i++

  # Diagonal Bingo
  # TopLeft-BottomRight
  inner_long_bingo = 0
  i = 0

  while i < (BOARD_ROWS * BOARD_COLS)
    inner_long_bingo += 1  if acquired[i]
    i += (BOARD_COLS + 1)
  long_bingo = inner_long_bingo  if inner_long_bingo > long_bingo

  # TopRight-BottomLeft
  inner_long_bingo = 0
  i = (BOARD_ROWS - 1)

  while i < (1 + BOARD_COLS * (BOARD_ROWS - 1))
    inner_long_bingo += 1  if acquired[i]
    i += (BOARD_COLS - 1)
  long_bingo = inner_long_bingo  if inner_long_bingo > long_bingo
  long_bingo
