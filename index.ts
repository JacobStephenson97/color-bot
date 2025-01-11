import { Client, GatewayIntentBits, type ColorResolvable } from "discord.js";

console.log("Hello via Bun!");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
});

client.login(process.env.DISCORD_TOKEN);

client.on("ready", () => {
  console.log("Bot is ready!");
});

client.on("messageCreate", async (message) => {
  if (message.content.includes("!color")) {
    const author = await message.guild?.members.fetch(message.author.id);
    const colorRole = author?.roles.cache.find(r => r.name === message.author.displayName);
    const botPosition = message.guild?.roles.botRoleFor(message.guild.members.me!)?.position;
    if (!botPosition) {
      message.channel.send("Could not determine bot role position");
      return;
    }
    const newPosition = botPosition - 1;
    const colorCode = message.content.split(" ")[1];
    if (!colorCode.match(/^#(?:[0-9a-fA-F]{3}){1,2}$/) || !colorCode.match(/^#(?:[0-9a-fA-F]{3,4}){1,2}$/)) {
      message.channel.send("Invalid color code");
      return;
    }
    if (colorRole) {
      colorRole.setColor(colorCode as ColorResolvable);
      colorRole.setPosition(newPosition);
      message.channel.send("Your color role has been updated");
      return;
    }
    const role = await message.guild?.roles.create({
      name: message.author.displayName,
      color: colorCode as ColorResolvable,
      reason: "Color role",
      mentionable: true,
      position: newPosition,
    }).catch((error) => {
      console.error(error);
    });
    if (!role) {
      message.channel.send("Failed to create role");
      return;
    }
    message.member?.roles.add(role);
  }
});

