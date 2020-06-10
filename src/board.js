import React from "react";
import logo from "./logo.svg";
import bstone from "./black.svg";
import wstone from "./white.svg";
import "./board.css";
import "bootstrap/dist/css/bootstrap.css";

function allowDrop(ev) {
  ev.preventDefault();
}
// function drag(ev) {
//   ev.dataTransfer.setData("text", ev.target.id);
//   console.log("dragged");
// }
// function drop(ev) {
//   ev.preventDefault();
//   var data = ev.dataTransfer.getData("text");
//   console.log("dropped");
// }
function Stone(props) {
  let stone = props.color === "b" ? bstone : wstone;
  return (
    <div className="checker" id={props.value}>
      <img
        className="stone"
        id={props.value}
        src={stone}
        draggable="true"
        onDragStart={props.drag}
        // onDragOver={props.dragover}
        alt="Logo"
      />
    </div>
  );
}
function calculateWinner(squares) {
  const lines = [
    //   [0, 1, 2],
    [3, 4, 5],
    //   [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (
      Math.abs(squares[a]) &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return Boolean(squares[a] + 1) ? 1 : -1;
    }
  }
  return 0;
}

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      square: Array(9).fill(0),
      nextplayer: null,
      step: 0,
    };
    this.initialize = this.initialize.bind(this);
  }
  bmove() {
    this.setState({
      square: [1, -1, -1, 0, 0, 0, 1, 1, -1],
    });
  }
  initialize() {
    this.setState({
      square: [1, 1, 1, 0, 0, 0, -1, -1, -1],
      nextplayer: 1,
      step: 0,
    });
  }
  drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
  }
  neighbor(a, b) {
    if (a === 4 || b === 4) {
      return true;
    } else {
      var a3 = a.toString(3).split("").map(Number);
      var b3 = b.toString(3).split("").map(Number);
      if (a3.length === 1) {
        a3.unshift(0);
      }
      if (b3.length === 1) {
        b3.unshift(0);
      }
      if (
        (Math.abs(a3[0] - b3[0]) === 1 && Math.abs(a3[1] - b3[1]) === 0) ||
        (Math.abs(a3[0] - b3[0]) === 0 && Math.abs(a3[1] - b3[1]) === 1)
      ) {
        return true;
      } else {
        return false;
      }
    }
  }
  // dragover(ev) {
  //   console.log("dragOver");
  //   ev.preventDefault();
  //   ev.currentTarget.style.background = "lightyellow";
  // }
  rand_move(state, player) {
    // let current_state = state.slice();
    let index_from = [];
    let index_empty = [];
    for (let i = 0; i < 9; i++) {
      if (state[i] === player) {
        index_from.push(i);
      }
      if (state[i] === 0) {
        index_empty.push(i);
      }
    }
    // console.log("empty " + index_empty);
    let possible_move = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.neighbor(index_from[i], index_empty[j])) {
          possible_move.push([index_from[i], index_empty[j]]);
        }
      }
    }
    if (possible_move.length !== 0) {
      let index = Math.floor(Math.random() * possible_move.length);
      state[possible_move[index][0]] = 0;
      state[possible_move[index][1]] = player;
    }
  }

  evol_move(state, player, repeat = 500, depth = 500) {
    let current_state = state.slice();
    let index_from = [];
    let index_empty = [];
    for (let i = 0; i < 9; i++) {
      if (current_state[i] === player) {
        index_from.push(i);
      } else if (current_state[i] === 0) {
        index_empty.push(i);
      }
    }
    let possible_move = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.neighbor(index_from[i], index_empty[j])) {
          possible_move.push([index_from[i], index_empty[j]]);
        }
      }
    }
    let possibility = [];
    for (let i = 0; i < possible_move.length; i++) {
      current_state = state.slice();
      current_state[possible_move[i][0]] = 0;
      current_state[possible_move[i][1]] = player;
      let results = [];
      for (let j = 0; j < repeat; j++) {
        for (let k = 0; k < depth; k++) {
          let _player = k % 2 === 0 ? player * -1 : player;
          // console.log(possible_move[i] + " at repeat " + j);
          // console.log("at depth " + k);
          this.rand_move(current_state, _player);
          // console.log("at depth " + k);
          // results.push(calculateWinner(current_state));
          if (calculateWinner(current_state)) {
            results.push(calculateWinner(current_state));
            // console.log("win");
            break;
          }
        }

        // console.log(possible_move[i] + " at repeat " + j);
        current_state = state.slice();
        current_state[possible_move[i][0]] = 0;
        current_state[possible_move[i][1]] = player;
      }
      // console.log("ok results: " + results);
      let count = 0;
      results.forEach((x) => {
        if (x === player) {
          count += 1;
        }
      });
      possibility.push(count / repeat);
    }
    console.log(possible_move, possibility, Math.max(...possibility));
    current_state = state.slice();
    current_state[
      possible_move[possibility.indexOf(Math.max(...possibility))][0]
    ] = 0;
    current_state[
      possible_move[possibility.indexOf(Math.max(...possibility))][1]
    ] = player;
    this.setState({
      square: current_state,
      step: this.state.step + 1,
      nextplayer: player * -1,
    });
  }

  drop(ev) {
    ev.preventDefault();
    var from = ev.dataTransfer.getData("text");

    if (
      (this.state.step === 0 &&
        this.neighbor(parseInt(from, 10), parseInt(ev.target.id, 10))) ||
      (this.state.step !== 0 &&
        this.state.nextplayer === this.state.square[from] &&
        this.neighbor(parseInt(from, 10), parseInt(ev.target.id, 10)))
    ) {
      let currentState = this.state.square;

      let target = currentState[from];
      currentState[from] = currentState[ev.target.id];
      currentState[ev.target.id] = target;
      let nxtnextplayer = target * -1; //cannot use this.state.square[from] because it has mutated

      let nxtstep = this.state.step + 1;
      this.setState(
        {
          square: currentState,
          step: nxtstep,
          nextplayer: nxtnextplayer,
        },
        () => {
          setTimeout(
            () => this.evol_move(this.state.square, this.state.nextplayer),
            500
          );
        }
      );
    }
  }

  render() {
    const winner = calculateWinner(this.state.square);
    let status;
    if (winner) {
      status = (winner === 1 ? "Black" : "White") + " wins!";
    } else if (this.state.step !== 0 && this.state.nextplayer === 1) {
      status = "Next Player: Black";
    } else if (this.state.step !== 0 && this.state.nextplayer === -1) {
      status = "Next Player: White";
    }
    let squares = [];
    for (let i = 0; i < 9; i++) {
      if (this.state.square[i] === 0) {
        squares.push(
          <div
            className="checker"
            onDrop={(ev) => this.drop(ev)}
            onDragOver={allowDrop}
            id={i.toString()}
          ></div>
        );
      } else {
        squares.push(
          <Stone
            value={i}
            color={this.state.square[i] === 1 ? "b" : "w"}
            drag={(ev) => this.drag(ev)}
          />
        );
      }
    }

    return (
      <div>
        <div className="board">
          {squares}

          <div className="boardimage"></div>
        </div>
        <div class="btwrapper">
          <button className="button" onClick={this.initialize}>
            Start!
          </button>
        </div>
        <div class="btwrapper">
          <button
            className="button"
            onClick={() => {
              this.evol_move(
                this.state.square,
                parseInt(this.state.nextplayer, 10)
              );
              // console.log(this.state.square + " " + this.state.nextplayer);
            }}
          >
            Help me move!
          </button>
        </div>
        <div class="btwrapper">
          <span>{status}</span>
        </div>
      </div>
    );
  }
}

export default Board;
