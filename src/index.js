import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

/**
 * Array to map board cells to columns and rows
 */
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


/**
 * Function component that renders one square in the board
 * @param {object} props Object containing properties necessary for rendering the square
 *    Required properties:
 *      - value: value to display in the square: 'X' or 'O' or null
 *      - onClick: function for actions to take when the square is clicked 
 * @returns Rendered square
 */
 function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

/**
 * Function component that renders the board
 * @param {object} props Object containing properties necessary for rendering the game board
 *    Required properties:
 *      - squares: a collection of Square components to assemble into a board
 *      - squareClick: function for actions to take when the square is clicked 
 * @returns Rendered tic-tac-toe game board
 */
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
          onClick:() => props.squareClick(squareId)
        })
    }
    rows[rowid] = React.createElement('div', {className: "board-row", key: rowid}, eachRowElements[0], eachRowElements[1], eachRowElements[2])
  }

  return (React.createElement('div', {}, rows[0], rows[1], rows[2]));
}

/**
 * Top-level component to render tic-tac-toe game. Handles all state and passes rendering to sub-components
 */
class Game extends React.Component {
  /**
   * Constructor that sets up state
   *  - Creates nine empty squares 
   *  - Initializes stepNumber to 0
   *  - Begins the game with X's move being first
   * @param {object} props  Object containing properties for rendering the component (No props needed)
   */
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

  /**
   * Handles the click of a board square.  Turns an empty square into 'X' or 'O' depending upon whose turn it is
   *  and ignores clicks when a winner has already been determined or the clicked square already has been taken
   * @param {number} i   Integer representing the index of the board square that was clicked 
   */
   handleSquareClick(i) {
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

  /**
   * Jumps to a step of the game
   * @param {number} step  Integer representing the index of the move to jump to
   */
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  /**
   * Renders the Game
   * @returns Rendered game board representing the current or selected state of the game
   */
  render() {
    const history = this.state.history;
    const currentMove = history[this.state.stepNumber];
    const winner = calculateWinner(currentMove.squares);

    const moves = history.map((step, move) => {
      let desc = 'Go to game start';
      let className = '';
      if (move) {
        const previousMove = history[move - 1];
        desc = 'Go to move # ' + move + ' (' + determineChangedSquare(step.squares, previousMove.squares) + ')';
        className = move === this.state.stepNumber ? 'current-move' : 'not-current-move';
      }
      return (
        <li key={move} className={className}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });
  
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
            squareClick={(i) => this.handleSquareClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
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

/**
 * Determines whether the game (represented by the squares parameter) has a winner 
 * @param {Array} squares  Array of squares to inspect to determine whether there's a winner
 * @returns 'X' if X has won, 'O' if O has won, and null if no one has won
 */
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

/**
 * Returns the index of the square that has changed between the previous move and the current move
 * @param {Array} currentMoveSquares Array representing the squares as of the current move
 * @param {Array} previousMoveSquares Array representing the squares as of the previous move
 * @returns index of the square that has changed between the previous move and the current move
 */
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

