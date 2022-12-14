/*
  Author: Lau
  Date: August 22
  Commands: 
            - !global <message>: Send a global message (requires moderator permission)
  
*/
import Plugin from "../Plugin";
import { hasProps, isNumber, isString, isLength } from "../../utils/validation";

export default class GlobalMessage extends Plugin {
  constructor(users, rooms) {
    super(users, rooms);

    this.events = {
      send_message: this.sendMessage,
    };

    this.commands = {
      
      'global': this.globalMessage,
    };

    this.bindCommands();

    this.messageRegex = /[^ -~]/i;
    this.maxMessageLength = 48;
  }

  
  
   // Events

   sendMessage(args, user) {
    if (!hasProps(args, "message")) {
      return;
    }

    if (!isString(args.message)) {
      return;
    }

    if (this.messageRegex.test(args.message)) {
      return;
    }

    // Remove extra whitespace
    args.message = args.message.replace(/  +/g, " ").trim();

    if (!isLength(args.message, 1, this.maxMessageLength)) {
      return;
    }

    if (
      args.message.startsWith("!") &&
      this.processCommand(args.message, user)
    ) {
      return;
    }

    user.room.send(
      user,
      "send_message",
      { id: user.data.id, message: args.message },
      [user],
      true
    );
  }

 

  // Commands

  bindCommands() {
    for (let command in this.commands) {
      this.commands[command] = this.commands[command].bind(this);
    }
  }

  processCommand(message, user) {
    message = message.substring(1);

    let args = message.split(" ");
    let command = args.shift().toLowerCase();

    if (command in this.commands) {
      this.commands[command](args, user);
      return true;
    }

    return false;
  }

  
  globalMessage(args, user) {
    if (args.length > 0 && user.isModerator) {
      let message = args.join(" ");
      let worldUsers = Object.keys(this.users);
      for (let i = 0; i < worldUsers.length; i++) {
        this.users[worldUsers[i]].send("error", { error: message });
      }
    }
  }
}
