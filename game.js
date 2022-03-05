const prompt = require("prompt-sync")({ sigint: true });

const hat = "^";
const hole = "O";
const fieldCharacter = "░";
const pathCharacter = "*";

class Field {
  constructor(width, height, percentageOfHole) {
    this.width = width;
    this.height = height;
    this.percentageOfHole = percentageOfHole;
    this.boardMap = Field.generateField(width, height, percentageOfHole);
    this.playerPosition = [0, 0]; // [x,y]
    this.randomPlayerPosition();

    this.hatPosition = [0, 0];
    this.randomHatPosition();

    this.wasHere = [];
    this.correctPath = [];
    this.isThereAnyExit();

    this.gameStart = false;
    this.hardMode = false;
  }

  async isThereAnyExit() {
    this.wasHere = [];
    this.correctPath = [];

    for (let row = 0; row < this.boardMap.length; row++) {
      this.wasHere[row] = [];
      this.correctPath[row] = [];
      for (let column = 0; column < this.boardMap[row].length; column++) {
        this.wasHere[row][column] = false;
        this.correctPath[row][column] = false;
      }
    }

    while (
      !(await this.recursiveSolve(
        this.playerPosition[0],
        this.playerPosition[1]
      ))
    ) {
      this.boardMap = Field.generateField(
        this.width,
        this.height,
        this.percentageOfHole
      );
      await this.isThereAnyExit();
    }
  }

  async recursiveSolve(x, y) {
    if (x == this.hatPosition[0] && y == this.hatPosition[1]) return true;
    if (this.boardMap[y][x] == hole || this.wasHere[y][x]) return false;

    this.wasHere[y][x] = true;

    if (x != 0) {
      if (await this.recursiveSolve(x - 1, y)) {
        this.correctPath[y][x] = true;
        return true;
      }
    }
    if (x != this.boardMap[y].length - 1) {
      if (await this.recursiveSolve(x + 1, y)) {
        this.correctPath[y][x] = true;
        return true;
      }
    }
    if (y != 0) {
      if (await this.recursiveSolve(x, y - 1)) {
        this.correctPath[y][x] = true;
        return true;
      }
    }
    if (y != this.boardMap.length - 1) {
      if (await this.recursiveSolve(x, y + 1)) {
        this.correctPath[y][x] = true;
        return true;
      }
    }

    return false;
  }

  randomPlayerPosition() {
    const x = Math.floor(Math.random() * this.boardMap[0].length);
    const y = Math.floor(Math.random() * this.boardMap.length);
    this.playerPosition = [x, y];
  }

  randomHatPosition() {
    let x = Math.floor(Math.random() * this.boardMap[0].length);
    let y = Math.floor(Math.random() * this.boardMap.length);

    while (x == this.playerPosition[0] && y == this.playerPosition[1]) {
      x = Math.floor(Math.random() * this.boardMap[0].length);
      y = Math.floor(Math.random() * this.boardMap.length);
    }

    this.hatPosition = [x, y];
  }

  static generateField(width, height, percentageOfHole) {
    let fullMap = [];
    for (let row = 0; row < height; row++) {
      let columns = [];
      for (let column = 0; column < width; column++) {
        columns.push(fieldCharacter);
      }
      fullMap.push(columns);
    }

    for (let i = 0; i < width * height; i++) {
      const randomChange = Math.floor(Math.random() * 100);
      if (randomChange <= percentageOfHole) {
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);
        fullMap[y][x] = hole;
      }
    }

    return fullMap;
  }

  print() {
    console.clear();
    this.boardMap[this.playerPosition[1]][this.playerPosition[0]] =
      pathCharacter;
    this.boardMap[this.hatPosition[1]][this.hatPosition[0]] = hat;
    console.log(this.boardMap.map((v) => v.join("")).join("\n"));
  }

  moveUp() {
    if (this.playerPosition[1] - 1 < 0) {
      console.log("you are out of bounds");
      this.gameStart = false;
      return;
    }
    if (
      this.boardMap[this.playerPosition[1] - 1][this.playerPosition[0]] ==
      pathCharacter
    ) {
      return;
    }
    this.playerPosition[1]--;
  }

  moveDown() {
    if (this.playerPosition[1] + 1 > this.boardMap.length - 1) {
      console.log("you are out of bounds");
      this.gameStart = false;
      return;
    }
    if (
      this.boardMap[this.playerPosition[1] + 1][this.playerPosition[0]] ==
      pathCharacter
    ) {
      return;
    }
    this.playerPosition[1]++;
  }

  moveLeft() {
    if (this.playerPosition[0] - 1 < 0) {
      console.log("you are out of bounds");
      this.gameStart = false;
      return;
    }
    if (
      this.boardMap[this.playerPosition[1]][this.playerPosition[0] - 1] ==
      pathCharacter
    ) {
      return;
    }
    this.playerPosition[0]--;
  }

  moveRight() {
    if (
      this.playerPosition[0] + 1 >
      this.boardMap[this.playerPosition[1]].length - 1
    ) {
      console.log("you are out of bounds");
      this.gameStart = false;
      return;
    }
    if (
      this.boardMap[this.playerPosition[1]][this.playerPosition[0] + 1] ==
      pathCharacter
    ) {
      return;
    }
    this.playerPosition[0]++;
  }

  checkCondition() {
    switch (this.boardMap[this.playerPosition[1]][this.playerPosition[0]]) {
      case hat:
        console.log("congrat you found your hat");
        this.gameStart = false;
        break;
      case hole:
        console.log("sorry you fell to hole");
        this.gameStart = false;
        break;
    }
  }

  selectMenu() {
    console.log("Select Mode\n");
    console.log("1. Easy Mode");
    console.log("2. Hard Mode");
    const input = prompt("\nyour action > ");
    if (input == "2") this.hardMode = true;
  }

  startGame() {
    this.selectMenu();
    this.gameStart = true;
    while (this.gameStart) {
      myField.print();

      const input = prompt("w:up, a:left, s: down, d:right : ").toLowerCase();
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

      if (this.hardMode) {
        let x = Math.floor(Math.random() * this.boardMap[0].length);
        let y = Math.floor(Math.random() * this.boardMap.length);

        while (
          this.boardMap[y][x] == hole ||
          (x == this.playerPosition[0] && y == this.playerPosition[1]) ||
          (x == this.hatPosition[0] && y == this.hatPosition[1])
        ) {
          x = Math.floor(Math.random() * this.boardMap[0].length);
          y = Math.floor(Math.random() * this.boardMap.length);
        }

        this.boardMap[y][x] = hole;
      }
    }
  }
}

const myField = new Field(10, 10, 50);

myField.startGame();
