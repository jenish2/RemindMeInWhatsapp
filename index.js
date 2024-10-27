const Bot = require("./Bot");

const botConfig = {
    authFolder: "auth",
    selfReply: false,
  };
  

const bot = new Bot(botConfig);

(async () => {
    await bot.connect();
    await bot.run();
})();

