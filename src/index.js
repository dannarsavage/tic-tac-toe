import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


let awfulCellMapping = [
  "1, 1",
  "2, 1",
  "3, 1",
  "1, 2",
  "2, 2",
  "3, 2",
  "1, 3",
  "2, 3",
  "3, 3"
]


function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

function Board(props) {
  let rows = Array(3);
  for (let rowid = 0; rowid < 3; rowid++) {
    let eachRowElements = Array(3);
    for (let cellid = 0; cellid < 3; cellid++) {
      const squareId = (rowid * 3) + cellid
      console.log("SquareID = " + squareId);
      eachRowElements[cellid] = React.createElement(
        Square, 
        {
          value: props.squares[squareId], 
          onClick:() => props.onClick(squareId)
        })
    }
    rows[rowid] = React.createElement('div', {className: "board-row", key: rowid}, eachRowElements[0], eachRowElements[1], eachRowElements[2])
  }

  return (React.createElement('div', {}, rows[0], rows[1], rows[2]));
}

/**
 * React function component for rendering game history
 * @param {object} props Object containing properties necessary for rendering the game history 
 *    Required properties:
 *      - history: array of all moves made so far in the game
 *      - jumpToMove: function for actions to take when a button is clicked to jump to a different move in the history 
 *      - stepNumber: integer indicating the move to be displayed to the user
 * @returns Rendered game history list with current move emboldened
 */
function GameHistory(props) {
  const moves = props.history.map((step, move) => {
    let desc = 'Go to game start';
    let className = '';
    if (move) {
      const previousMove = props.history[move - 1];
      desc = 'Go to move # ' + move + ' (' + determineChangedSquare(step.squares, previousMove.squares) + ')';
      className = move === props.stepNumber ? 'current-move' : 'not-current-move';
    }
    return (
      <li key={move} className={className}>
        <button onClick={() => props.jumpToMove(move)}>{desc}</button>
      </li>
    );
  });
  return (
      <ol>{moves}</ol>
    )
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
    }
  }

  handleBoardClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';    
    this.setState({
      history: history.concat({
        squares: squares,
      }),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  render() {
    const history = this.state.history;
    const currentMove = history[this.state.stepNumber];
    const winner = calculateWinner(currentMove.squares);
  
    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return ( 
      <div className="game">
        <div className="game-board">
          <Board 
            squares={currentMove.squares}
            onClick={(i) => this.handleBoardClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <GameHistory
            history={this.state.history}
            stepNumber={this.state.stepNumber}
            jumpToMove={(mv) => this.jumpTo(mv)}
          />
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function determineChangedSquare(currentMoveSquares, previousMoveSquares) {
  for (let i = 0; i < currentMoveSquares.length; i++) {
    if (currentMoveSquares[i] !== previousMoveSquares[i])
    {
      return awfulCellMapping[i];
    }
  }
  console.warn('Trouble determining changed cell')
  return "";
}

