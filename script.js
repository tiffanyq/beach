let toForURL="";
let fromForURL="";
let msgForURL="";

// for moving labels for walk down the beach
let sentTo = "you";
let sentFrom = "me";
let toWidth;
let fromWidth;

const BASE_URL = "tiffanyq.github.io/beach?"
const ALPHABET = {
  "a": "n",
  "b": "o",
  "c": "p",
  "d": "q",
  "e": "r",
  "f": "s",
  "g": "t",
  "h": "u",
  "i": "v",
  "j": "w",
  "k": "x",
  "l": "y",
  "m": "z",
  "n": "a",
  "o": "b",
  "p": "c",
  "q": "d",
  "r": "e",
  "s": "f",
  "t": "g",
  "u": "h",
  "v": "i",
  "w": "j",
  "x": "k",
  "y": "l",
  "z": "m"
}

const NUMBERS = {
  "0": "5",
  "1": "6",
  "2": "7",
  "3": "8",
  "4": "9",
  "5": "0",
  "6": "1",
  "7": "2",
  "8": "3",
  "9": "4"
}

/* switches between code form and message form */
function switchCodeAndMessage(content) {
  const characters = content.split("");
  let switchedContent = "";
  let nextLetter;
  for (let i = 0; i < characters.length; i++) {
    currChar = characters[i].toLowerCase();
    if (currChar in ALPHABET) {
      nextLetter = ALPHABET[currChar];
      // ensure character is the correct case
      if (currChar !== characters[i]) {
        nextLetter = nextLetter.toUpperCase();
      }
    }
    else if (currChar in NUMBERS) {
      nextLetter = NUMBERS[currChar];
    }
    else {
      nextLetter = currChar;
    }
    switchedContent += nextLetter;
  }
  return switchedContent;
}

function updateTo(e) {
  let to = e.target.value;
  toForURL = encodeURIComponent(switchCodeAndMessage(to)).replace(/\(/g, "%28").replace(/\)/g, "%29");
  updateURLToCopy();
}

function updateFrom(e) {
  const from = e.target.value;
  fromForURL = encodeURIComponent(switchCodeAndMessage(from)).replace(/\(/g, "%28").replace(/\)/g, "%29");
  updateURLToCopy();
}

function updateMessage(e) {
  const msg = e.target.value;
  msgForURL = encodeURIComponent(switchCodeAndMessage(msg)).replace(/\(/g, "%28").replace(/\)/g, "%29");
  updateURLToCopy();
}

function updateURLToCopy() {
  const urlToCopy = document.getElementById("link-to-copy");
  let tempURL = BASE_URL;
  if (toForURL) {
    tempURL = tempURL + "t=" + toForURL;
  }
  if (fromForURL) {
    tempURL = tempURL + "&f=" + fromForURL;
  }
  if (msgForURL) {
    tempURL = tempURL + "&m=" + msgForURL;
  }
  urlToCopy.value = tempURL;
}

window.onload = function() {
  const toInput= document.getElementById("to-input");
  const fromInput = document.getElementById("from-input");
  const msgInput = document.getElementById("msg-input");
  toInput.addEventListener("input", updateTo);
  fromInput.addEventListener("input", updateFrom);
  msgInput.addEventListener("input", updateMessage);
  // decode message if applicable
  const queryString = window.location.search;
  const param = new URLSearchParams(queryString);
  const to = param.get('t');
  const from = param.get('f');
  const message = param.get('m');
  if (to) {
    let decodedTo = switchCodeAndMessage(decodeURIComponent(to));
    const customTo = document.getElementById("to-in-message");
    customTo.innerText = " " + decodedTo;
    const toInCopy = document.getElementById("to-in-copy");
    toInCopy.innerText = decodedTo;
    sentTo = decodedTo;
  }
  if (from) {
    let decodedFrom = switchCodeAndMessage(decodeURIComponent(from));
    const customFrom = document.getElementById("from-in-message");
    customFrom.innerText = decodedFrom;
    sentFrom = decodedFrom;
  }
  if (message) {
    let decodedMsg = switchCodeAndMessage(decodeURIComponent(message));
    const customMsg = document.getElementById("custom-message");
    customMsg.innerText = decodedMsg;
  }
  // compute widths
  let toElement = document.getElementById("to");
  toElement.innerText = sentTo;;
  toWidth = toElement.offsetWidth;
  let fromElement = document.getElementById("from");
  fromElement.innerText = sentFrom;
  fromWidth = fromElement.offsetWidth;
  let bbox = this.document.getElementById("to-from-measurement");
  bbox.style.display = "none";
}