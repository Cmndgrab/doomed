
let main = document.querySelector("main");
let input = document.querySelector("input");

function print(text) {
  // to print some text we first create a new paragraph tag, like having a <p></p> in HTML
  var p = document.createElement("p");
  // Then we put our text inside the new p element
  p.innerHTML = text;
  // We add our p element to the document as the last thing in the html body
  main.appendChild(p);
  // The player may have scrolled the page, so make sure we scroll to make the new text visible
  p.scrollIntoView();
  
}

//
// Simple dungeon game
//

var character = { inventory: [], location: "darkness" };

var dungeon = {
  "start":{
    short_description: "Start",
    long_description:"move to the darkness",
    contents: [],
    exits: {east : "darkness"}
  },

  "darkness": {
    short_description: "emptiness",
    long_description:
      " the dark, you hear screams, nothing but screams, you cant escape and you cant win and you cant breathe",
    contents: [],
    exits: { east: "centre room" }
  },
  "east room": {
    short_description: "east room",
    long_description:
      "a room full of bodies, you can smell the copper, it fills your nose and you retch, you look to your east and see a table containing some dark trinkers. you see a hole narrow enough to crawl through in front of you,",
    contents: [],
    exits: { east: "centre room", north:"death"}
  },
  "centre room": {
    short_description: "centre room",
    long_description:
      " a windowless chamber lit only by the eerie light of glowing fungi. \n A rope hangs down from a room above. you can hear crying from up there",
    contents: ["paper"],
    exits: { east: "east room", north: "attic room" }
  },
  "attic room": {
    short_description: "attic room",
    long_description:
      "the attic. It looks like it hasn't been entered in years. This place is filled with cobwebs, \n and a dirty window overlooks the roof, but is painted shut.",
    contents: ["crowbar", "spear"],
    exits: {
      south: "centre room",
      east: "closet"
    }
  },
  "death": {
    short_description: "death",
    long_description:
      "As you crawl through the hole, you feel it constrict around you, It begins to squeeze, you can't escape. As your vision goes black you hear laughter.",
    contents: [],
    exits: {
      
    }
  },
  roof: {
    short_description: "roof",
    long_description:
      "the long, sloping roof. There is a gargoyle nearby watching you.",
    contents: ["keycard"],
    exits: {
      east: "attic room",
      south: "attic room"
    }
  },
  end: {
    short_description: "light",
    long_description:
      "The mirror looks back at you, and pulls you through, you wake up in your own bed, sweating and shaking. You look at the clock, You fell asleep. That is all it was. Just a dream.",
    contents: [],
    exits: {
    }
  },
  closet: {
    short_description: "closet",
    long_description: "a dark, musty closet, which makes you want to sneeze.",
    contents: ["wire coathanger"],
    exits: {
      west: "attic room"
    }
  },
  lab: {
    short_description: "secret laboratory",
    long_description:
      "a secret lab filled with bubbling vials and the static discharge of Jacob's ladders and Van de Graff generators, there is a strange console in the middle of the room, with a slot for a keycard.",
    contents: ["batteries"],
    exits: {
      north: "closet"
    }
  }
};

const help = `Try typing a direction, like "east" or "up'. If you are in a room with items, you can type "take [item]" or even "take all" to pick up everything in the room, and type "use" with that item to use it. To see the long description of a room, including items and exits, type "look." You can type "inventory" to see what you are carrying, and "help" to see these instructions again.


`;

function command_split(str) {
  var parts = str.split(/\s+/); // splits string into an array of words, taking out all whitespace
  var command = parts.shift(); // command is the first word in the array, which is removed from the array
  var object = parts.join(" "); // the rest of the words joined together.  If there are no other words, this will be an empty string
  return [command, object];
}

var room, command, verb, obj;

function remove(array, item) {
  var idx = array.indexOf(item);
  if (idx > -1) {
    array.splice(idx, 1);
  }
}

function long_direction(short) {
  let key = short[0];
  return {
    n: "north",
    s: "south",
    e: "east",
    w: "west",
    u: "up",
    d: "down",
    i: "in", // we don't actually use this short form, because 'inventory'
    o: "out",
    a: "above",
    b:"below"
  }[key];
}

function move_to_room(room_name) {
  character.location = room_name;
  room = dungeon[room_name];
  describe(room);
}

function move(verb) {
  let direction = long_direction(verb); // fix up abbreviations
  // special cases for movement
  if (direction === "east" && room.short_description === "closet") {
    print("Moving futher back in the dark closet, you find stairs going down");
    move_to_room("lab");
  } else if (room.exits[direction]) {
    // general case for move
    move_to_room(room.exits[direction]);
  } else {
    print("You cannot go that way");
  }
}

function printInventory() {
  print("You are carrying:");
  character.inventory.forEach(function(item) {
    print("&nbsp;&nbsp;&nbsp;&nbsp;" + item);
  });
}

function describe(room, force) {
  if (force || !room.visited) {
    print("You are in " + room.long_description);
    room.visited = true;
  } else {
    print(room.short_description);
  }
  var exits = Object.keys(room.exits);
  if (exits.length > 1) {
    var last_exit = exits.pop();
    print("There are exits to the " + exits.join(", ") + " and " + last_exit);
  } else {
    print("There is an exit to the " + exits[0]);
  }
  room.contents.forEach(function(item) {
    print("There is a " + item + " here");
  });
}

function take_item(obj) {
  if (obj === "all") {
    if (room.contents) {
      // this part: [:] makes a copy of the list so removing items works
      while (room.contents.length) {
        let item = room.contents.pop();
        print("You pick up the " + item);
        character.inventory.push(item);
      }
    } else {
      print("There is nothing to take!");
    }
  } else {
    let found = false;
    room.contents.forEach(function(item) {
      if (item.includes(obj)) {
        // does the word in obj match any part of the text of item?
        found = true;
        print("You pick up the " + item);
        character.inventory.push(item);
        remove(room.contents, item);
      }
    });
    if (!found) {
      print("There is no " + obj + " here.");
    }
  }
}

function item_from(arr, obj) {
  for (let idx in arr) {
    let thing = arr[idx];
    console.log("is a %s a %s?", thing, obj);
    if (thing.includes(obj)) {
      return thing;
    }
  }
  return null;
}

function use_item(obj) {
  let item = item_from(character.inventory, obj);
  if (!item) {
    print("You aren't carrying a " + obj);
    return;
  }
  // Now we can use the item if it is the right object and we are in the right room
  // special cases
  if (item === "crowbar" && character.location === "attic room") {
    print("You swing the crowbar, smashing open the window!");
    // Modify the exits from the attic
    dungeon["attic room"].exits.out = "roof";
    dungeon["attic room"].exits.west = "roof";
  }
  if (item === "keycard" && character.location === "lab") {
    print("You insert the keycard, The entire structure begins to hum, and a mirror rises from the floor, Its surface is fluid, and you can hear it calling to you");
    // Modify the exits from the attic
    dungeon["lab"].exits.out = "end";
   
  } 

  if (item === "paper") {
    print("A note hastily written in blood, it says there is a secret door built into a closet, that the door leads out, it could be an escape.");
    // Modify the exits from the attic
    
   
  } 
}

function drop_item(obj) {
  let item;
  if (obj === "all") {
    if (character.inventory) {
      while (character.inventory.length) {
        item = character.inventory.pop();
        print("You dropped the " + item);
        room.contents.push(item);
      }
    } else {
      print("You aren't carrying anything");
    }
  } else {
    let found = false;
    character.inventory.forEach(function(item) {
      if (item.includes(obj)) {
        // does the word in obj match any part of the text of item?
        found = true;
        print("You drop the " + item + ".");
        room.contents.push(item);
        remove(character.inventory, item);
      }
    });
    if (!found) {
      print("You aren't carrying a " + obj + ".");
    }
  }
}

room = dungeon[character.location];
describe(room);

function getOneCommand(text) {
  room = dungeon[character.location];
  command = command_split(text.toLowerCase());
  verb = command[0];
  obj = command[1];
  console.log("verb: " + verb + ", object: " + obj);
  if (
    [
      "east",
      "west",
      "north",
      "south",
      "up",
      "down",
      "in",
      "out",
      "e",
      "w",
      "n",
      "s",
      "u",
      "d",
      "above",
      "below"
    ].includes(verb)
  ) {
    move(verb);
  } else if (["inventory", "in", "i"].includes(verb)) {
    printInventory();
  } else if (["look", "examine", "describe", "l"].includes(verb)) {
    describe(room, true);
  } else if (["take", "pickup", "t"].includes(verb)) {
    take_item(obj);
  } else if (["use", "try", "apply"].includes(verb)) {
    use_item(obj);
  } else if (["drop", "throw", "release"].includes(verb)) {
    drop_item(obj);
  }
  else if (["help"].includes(verb)) {
    getHelp();
  }
}

function getInput(evt) {
  if (evt.code === "Enter") {
    let text = input.value;
    input.value = "";
    getOneCommand(text);
  }
}

function getHelp(){
  {
    print(help)

  }
}
input.addEventListener("keyup", getInput, false);


