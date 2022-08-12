process.env.NTBA_FIX_319 = 1;
const TelegramBot = require("node-telegram-bot-api");

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome", {
    reply_markup: {
      keyboard: [["Hi", "Bye"], ["I'm robot"]],
    },
  });
});

// Listen for any kind of message. There are different kinds of messages.
bot.on("message", (msg) => {
  var hi = "hi";
  var hello = "hello";
  if (
    msg.text.toString().toLowerCase().indexOf(hi) === 0 ||
    msg.text.toString().toLowerCase().indexOf("hello") === 0
  ) {
    bot.sendMessage(msg.chat.id, `Hi ${msg.from.first_name} 😎!!`);
  }

  var bye = "bye";
  if (msg.text.toString().toLowerCase().includes(bye)) {
    bot.sendMessage(msg.chat.id, "Hope to see you around again , Bye");
  }

  var robot = "I'm robot";
  if (msg.text.indexOf(robot) === 0) {
    bot.sendMessage(msg.chat.id, "Yes I'm robot but not in that way!");
  }
});

bot.on("message", (msg) => {
  var what = "fuck";
  if (msg.text.includes(what)) {
    bot.kickChatMember(msg.chat.id, msg.from.id);
  }
});

// Matches "/commands"
bot.onText(/\/commands/, function (msg, match) {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content of the message
  const chatId = msg.chat.id;
  const res =
    "List of Commands" +
    "/n commands - list available commands /n echo - Echoes text following the command (Eg: /echo Hello) /n greet - Greets a person followed by the command (Eg: /greet Harry) /n share_contact - Allows you to share your contact to the bot /n ball - Move an animated ball using coordinates in an online editor";

  bot.sendMessage(chatId, res);
});

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, function (msg, match) {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content of the message
  const chatId = msg.chat.id;
  const res = match[1]; // the captured "whatever"

  bot.sendMessage(chatId, res);
});

//Greet
bot.onText(/\/greet (.+)/, function (msg, match) {
  const chatId = msg.chat.id;
  const res = `Hello ${match[1]}, How are you doing?`;

  bot.sendMessage(chatId, res);
});

// Create a /BALL command
bot.onText(/\/ball/, function (msg, match) {
  const open = require("open");
  console.log("Received ball motion request");

  open("https://editor.p5js.org/dharun-narayanan/full/zBXkqNr8O");
  bot.sendMessage(
    msg.chat.id,
    "Open the editor url to see the effect. To move the ball in the editor, use command (/move x y) eg: /move 0.1 0.1"
  );
  bot.sendMessage(
    msg.chat.id,
    "Url: https://editor.p5js.org/dharun-narayanan/full/zBXkqNr8O"
  );
});
bot.onText(/\/move (.+)/, function (msg, match) {
  const open = require("open");
  console.log("Starting ball motion request");

  open("https://editor.p5js.org/dharun-narayanan/full/zBXkqNr8O");
  bot.sendMessage(msg.chat.id, `Ball Moved to ${match[1]} coordinate`);

  const coordinates = match[1].split(" ");
  const xpos = parseFloat(coordinates[0]);
  const ypos = parseFloat(coordinates[1]);
  const coordObj = {
    x: xpos,
    y: ypos,
  };
  console.log(coordObj);

  // Broadcast that message to all connected clients
  wsServer.clients.forEach(function (client) {
    client.send(JSON.stringify(coordObj));
  });
});

// THE WEBSOCKET SERVER PART
const WebSocket = require("ws");

const PORT = 5000;

const wsServer = new WebSocket.Server({
  port: PORT,
});

wsServer.on("connection", function (socket) {
  // Some feedback on the console
  console.log("A client just connected");

  // Attach some behavior to the incoming socket
  socket.on("message", function (msg) {
    console.log("Received message from client: " + msg);
    // socket.send("Take this back: " + msg);

    // Broadcast that message to all connected clients
    wsServer.clients.forEach(function (client) {
      client.send(msg);
    });
  });
});

console.log(new Date() + " Server is listening on port " + PORT);

bot.onText(/^\/share_contact/, function (msg, match) {
  var option = {
    parse_mode: "Markdown",
    reply_markup: {
      one_time_keyboard: true,
      keyboard: [
        [
          {
            text: "My phone number",
            request_contact: true,
          },
        ],
        [{ text: "Location", request_location: true }],
        ["Cancel"],
      ],
    },
  };
  bot.sendMessage(msg.chat.id, "How can we contact you?", option).then(() => {
    bot.once("contact", (msg) => {
      bot.sendMessage(
        msg.chat.id,
        "Thank you " +
          msg.contact.first_name +
          " with phone " +
          msg.contact.phone_number +
          "! And where are you?"
      );
    });
  });
});

bot.on("location", (msg) => {
  console.log(msg.location.latitude);
  console.log(msg.location.longitude);
});

bot.on("contact", (msg) => {
  console.log(msg.contact.phone_number);
});

bot.onText(/\/bot_location/, async (msg) => {
  await bot.sendLocation(msg.chat.id, 11.657599, 78.1775, {
    live_period: 86400,
  });
});
