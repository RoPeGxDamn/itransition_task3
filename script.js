const crypto = require("crypto");
const { AsciiTable3 } = require("ascii-table3");
const rl = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});
const moves = process.argv.slice(2);

const RESULT_MAP = {
  1: "Lose",
  0: "Draw",
  "-1": "Win",
};
const CHECK_LINK = "https://www.freeformatter.com/hmac-generator.html";

const getGameStatus = (f, s) => {
  const count = moves.length;
  const half = Math.floor(count / 2);
  return Math.sign(((f - s + half + count) % count) - half);
};
const getRandomMove = (max) => Math.floor(Math.random() * max);

const AMTable = new AsciiTable3("Available moves: ").removeBorder();
moves.forEach((item, index) =>
  index == moves.length - 1
    ? AMTable.addRowMatrix([
        [`${index + 1} - ${item}`],
        ["0 - exit"],
        ["? - help"],
      ])
    : AMTable.addRow(`${index + 1} - ${item}`)
);

const helpTable = new AsciiTable3().setHeading("v PC\\User >", ...moves);
moves.forEach((item, yIndex) =>
  helpTable.addRow(
    item,
    ...moves.map((i, xIndex) => RESULT_MAP[getGameStatus(yIndex, xIndex)])
  )
);

if (
  moves.length <= 1 ||
  moves.length % 2 === 0 ||
  [...new Set(moves)].length !== moves.length
) {
  console.error(
    `Check uniqueness and count of arguments!\nExample: node script.js paper rock scissors`
  );
  process.exit();
}

const randomMove = getRandomMove(moves.length) + 1;
const computerMessage = `Computer move: ${moves[randomMove - 1]}`;
const secretKey = crypto.randomBytes(32).toString("hex").toLocaleUpperCase();
const hmac = crypto
  .createHmac("sha256", secretKey)
  .update(computerMessage)
  .digest("hex")
  .toLocaleUpperCase();
console.log(`HMAC:\n${hmac}`);
console.log(AMTable.toString());

rl.question("Enter your move: ", (num) => {
  switch (num) {
    case "?":
      console.log(helpTable.toString());
      rl.close();
      process.exit();
    case "0":
      rl.close();
      process.exit();
  }
  if (moves[num - 1]) {
    console.log(`Your move: ${moves[num - 1]}`);
    console.log(computerMessage);
    const status = getGameStatus(num, randomMove);
    status == 0
      ? console.log("Draw!")
      : console.log(
          `You ${RESULT_MAP[
            getGameStatus(num, randomMove)
          ].toLocaleLowerCase()}!`
        );
    console.log(`HMAC key:\n${secretKey}`);
    console.log(`To check HMAC: ${CHECK_LINK}`);
  } else {
    console.log(AMTable.toString());
  }
  rl.close();
});
