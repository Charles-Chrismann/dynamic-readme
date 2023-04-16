export class Cell {
    x: number;
    y: number;
    value: number;
    hidden = true;
    constructor(x: number, y: number, value: number){
      this.x = x;
      this.y = y;
      this.value = value;
    }
  
    revealCell(){
      this.hidden = false
    }
  
    toEmoji(){
      let values = [":white_large_square:", ":one:", ":two:", ":three:", ":four:", ":five:", ":six:", ":seven:", ":height:", ":boom:"]
      if(this.hidden) return ":black_large_square:"
      return values[this.value]
    }
}