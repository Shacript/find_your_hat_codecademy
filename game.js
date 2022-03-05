const prompt = require("prompt-sync")({ sigint: true });

const hat = "^";
const hole = "O";
const fieldCharacter = "░";
const pathCharacter = "*";
const deadBody = "X";
const victoryBody = "Y";

class Field {
  constructor(mapArray) {
    this.myField = mapArray || Field.generateField();
    if (mapArray && mapArray.length < 3 || mapArray && mapArray[0].length < 3)
      this.myField = Field.generateField();

    this.playerPosition = [0, 0];
    this.randomPlayerPostion();

    this.hatPosition = [0, 0];
    this.randomHatPostion();

    this.wasHere = [];
    this.correctPath = [];
    this.isThereAnyExit();

    this.gameStatus = false;
    this.hardMode = false;
  }

  async isThereAnyExit() {
    this.wasHere = [];
    this.correctPath = [];

    for (let row = 0; row < this.myField.length; row++) {
      this.wasHere[row] = [];
      this.correctPath[row] = [];
      for (let col = 0; col < this.myField[row].length; col++) {
        this.wasHere[row][col] = false;
        this.correctPath[row][col] = false;
      }
    }

    while (!await this.recursiveSolve(this.playerPosition[0], this.playerPosition[1])) {
        this.myField = Field.generateField();
        this.isThereAnyExit()
    }
  }

  // async for Maximum call stack size exceeded problem .
  //https://en.wikipedia.org/wiki/Maze-solving_algorithm
  async recursiveSolve(x, y) {
    if(x == this.hatPosition[0] && y == this.hatPosition[1]) return true; // reach to the hat
    // there is wall or you were there.
    if(this.myField[y][x] == hole || this.wasHere && this.wasHere[y] && this.wasHere[y][x]) return false; 

    this.wasHere[y][x] = true;

    if(x != 0){ // left edge check
        if(await this.recursiveSolve(x - 1, y)){
            this.correctPath[y][x] = true;
            return true;
        }
    }
    if(x != (this.myField[y].length - 1)){ // right edge check
        if(await this.recursiveSolve(x + 1, y)){
            this.correctPath[y][x] = true;
            return true;
        }
    }
    if(y != 0){ // top edge check
        if(await this.recursiveSolve(x, y - 1)){
            this.correctPath[y][x] = true;
            return true;
        }
    }
    if(y != (this.myField.length - 1)){ // bottom edge checkk
        if(await this.recursiveSolve(x, y + 1)){
            this.correctPath[y][x] = true;
            return true;
        }
    }

    return false;

  }

  randomHatPostion() {
    const height = this.myField.length;
    const width = this.myField[0].length;
    let x = Math.floor(Math.random() * width);
    let y = Math.floor(Math.random() * height);
    this.hatPosition = [x, y];
  }

  randomPlayerPostion() {
    const height = this.myField.length;
    const width = this.myField[0].length;
    let x = Math.floor(Math.random() * width);
    let y = Math.floor(Math.random() * height);
    while (this.myField[y][x] != fieldCharacter) {
      x = Math.floor(Math.random() * width);
      y = Math.floor(Math.random() * height);
    }
    this.playerPosition = [x, y];
  }

  checkCondition() {
    if (!this.gameStatus) return;
    switch (this.myField[this.playerPosition[1]][this.playerPosition[0]]) {
      case hole:
        this.myField[this.playerPosition[1]][this.playerPosition[0]] = deadBody;
        this.print();
        console.log("Sorry, you fell down a hole.");
        this.gameStatus = false;
        break;
      case hat:
        this.myField[this.playerPosition[1]][this.playerPosition[0]] =
          victoryBody;
        this.print();
        console.log("Congrat !, you found a hat !");
        this.gameStatus = false;
        break;
      case pathCharacter:
        this.myField[this.playerPosition[1]][this.playerPosition[0]] = deadBody;
        this.print();
        console.log("Sorry, that path you have already passed is broken.");
        this.gameStatus = false;
        break;
    }
  }

  moveUp() {
    if (this.isOutOfBound(this.playerPosition[1] - 1, this.playerPosition[0]))
      return;
    this.playerPosition[1]--;
  }

  moveDown() {
    if (this.isOutOfBound(this.playerPosition[1] + 1, this.playerPosition[0]))
      return;
    this.playerPosition[1]++;
  }

  moveLeft() {
    if (this.isOutOfBound(this.playerPosition[1], this.playerPosition[0] - 1))
      return;
    this.playerPosition[0]--;
  }

  moveRight() {
    if (this.isOutOfBound(this.playerPosition[1], this.playerPosition[0] + 1))
      return;
    this.playerPosition[0]++;
  }

  isOutOfBound(y, x) {
    if (
      y >= this.myField.length ||
      y < 0 ||
      x >= this.myField[y].length ||
      x < 0
    ) {
      this.myField[this.playerPosition[1]][this.playerPosition[0]] = deadBody;
      this.print();
      console.log("Out of bounds.");
      this.gameStatus = false;
      return true;
    }
  }

  print() {
    console.clear();
    const playerGround =
      this.myField[this.playerPosition[1]][this.playerPosition[0]];
    this.myField[this.playerPosition[1]][this.playerPosition[0]] =
      playerGround == deadBody
        ? deadBody
        : playerGround == victoryBody
        ? victoryBody
        : pathCharacter;
    this.myField[this.hatPosition[1]][this.hatPosition[0]] = hat

    console.log(this.myField.map((v) => v.join("")).join("\n"));
  }

  selectMenu() {
    console.log("Find my hat ! \n");
    console.log("1. Easy Mode");
    console.log("2. Hard Mode");
    const input = prompt("Select : ").toLowerCase();
    this.hardMode = input == 2;
  }

  start() {
    this.selectMenu();
    this.gameStatus = true;
    while (this.gameStatus) {
      this.print();
      const input = prompt(
        "Which way? (w:up, s:down, a:left, d:right) : "
      ).toLowerCase();
      switch (input) {
        case "w":
          this.moveUp();
          break;
        case "s":
          this.moveDown();
          break;
        case "a":
          this.moveLeft();
          break;
        case "d":
          this.moveRight();
          break;
      }
      this.checkCondition();
      this.hardMode && this.randomHole();
    }
  }

  randomHole() {
    const height = this.myField.length;
    const width = this.myField[0].length;
    let x = Math.floor(Math.random() * width);
    let y = Math.floor(Math.random() * height);
    while (this.myField[y][x] != fieldCharacter || this.myField[y][x] == hole) {
      x = Math.floor(Math.random() * width);
      y = Math.floor(Math.random() * height);
    }
    this.myField[y][x] = hole;
  }

  static generateField(height, width, percentageForHole, randomThrow) {
    // Validate all arguments and set to default value
    height = height >= 3 ? height : 10;
    width = width >= 3 ? width : 10;
    percentageForHole =
      percentageForHole < 100 && percentageForHole >= 0
        ? percentageForHole
        : percentageForHole < 0
        ? 0
        : 30;
    randomThrow = randomThrow ? randomThrow : false;

    // Generate Full Map
    let fullMap = [];
    for (let a = 0; a < height; a++) {
      let columnMap = [];
      for (let b = 0; b < width; b++) {
        columnMap.push(fieldCharacter);
      }
      fullMap.push(columnMap);
    }

    // randomThrow it is like randomly throw hole to everywhere in the map
    // so it gonna throw (width * height) times and very times it gonna check that random position ,
    // Should have hole or not desire on percentageForHole
    // but if turn randomThrow [false] it is gonna check each position should have hole or not desire on percentageForHole;
    if (randomThrow) {
      for (let i = 0; i < width * height; i++) {
        if (Math.floor(Math.random() * 100) <= percentageForHole) {
          let x = Math.floor(Math.random() * width);
          let y = Math.floor(Math.random() * height);
          while (fullMap[y][x] == hole) {
            x = Math.floor(Math.random() * width);
            y = Math.floor(Math.random() * height);
          }
          fullMap[y][x] = hole;
        }
      }
    } else {
      for (let row in fullMap) {
        for (let column in fullMap[row]) {
          const dropHole = Math.floor(Math.random() * 100) <= percentageForHole;
          fullMap[row][column] = dropHole ? hole : fieldCharacter;
        }
      }
    }

    return fullMap;
  }
}

const game = new Field();

game.start();
