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
 * Class representing one move in tic tac toe
 */
class Move {
  /**
   * Constructor
   * @param {string} player 'X' or 'O'
   * @param {number} cellIndex integer representing the cell of the board into which the player moved
   * @param {Array} boardSquares Array representing the state of all squares after this move
   */
  constructor(player, cellIndex, boardSquares) {
    this.Player = player;
    this.CellIndex = cellIndex;
    this.BoardSquares = boardSquares;
  }
}

/**
 * Function component that renders one square in the board
 * @param {Object} props Object containing properties necessary for rendering the square
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
 * @param {Object} props Object containing properties necessary for rendering the game board
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
 * React function component for rendering game history
 * @param {object} props Object containing properties necessary for rendering the game history 
 *    Required properties:
 *      - history: array of all moves made so far in the game
 *      - jumpToMove: function for actions to take when a button is clicked to jump to a different move in the history 
 *      - stepNumber: integer indicating the move to be displayed to the user
 *      - sortAscending: Boolean indicating whether to sort the history ascending
 * @returns Rendered game history list with current move emboldened
 */
function GameHistory(props) {
  let moves = props.history.map((move, index) => {
    const desc = index === 0 
      ? 'Go to game start'
      : 'Go to move # ' + index + ' (' + move.Player + ' in ' + awfulCellMapping[move.CellIndex] + ')';
    const className = index === props.stepNumber 
      ? 'current-move'
      : '';
    return (
      <li key={index} className={className}>
        <button onClick={() => props.jumpToMove(index)}>{desc}</button>
      </li>
    );
  });
  if (!props.sortAscending) {
    moves = moves.reverse();
  }
  return (
      <ol>{moves}</ol>
    )
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
   * @param {Object} props  Object containing properties for rendering the component (No props needed)
   */
  constructor(props) {
    super(props);
    this.state = {
      history: [new Move(null, -1, Array(9).fill(null))],
      stepNumber: 0,
      xIsNext: true,
      sortHistoryAscending: true,
    }
  }

  flipHistorySortOrder() {
    this.setState({
      sortHistoryAscending: !this.state.sortHistoryAscending,
    });
  }

  /**
   * Handles the click of a board square.  Turns an empty square into 'X' or 'O' depending upon whose turn it is
   *  and ignores clicks when a winner has already been determined or the clicked square already has been taken
   * @param {number} i   Integer representing the index of the board square that was clicked 
   */
  handleSquareClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const previousMove = history[history.length - 1];
    let squares = previousMove.BoardSquares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const thisMovesPlayer = this.state.xIsNext ? 'X' : 'O';
    squares[i] = thisMovesPlayer;
    const thisMove = new Move(thisMovesPlayer, i, squares);
    this.setState({
      history: history.concat(thisMove),
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
    const winner = calculateWinner(currentMove.BoardSquares);
  
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
            squares={currentMove.BoardSquares}
            squareClick={(i) => this.handleSquareClick(i)}
          />
        </div>
        <div className="game-info">
        <div>{status}</div>
        <div><button onClick={() => this.flipHistorySortOrder()}>Flip History</button></div>
          <GameHistory
            history={this.state.history}
            stepNumber={this.state.stepNumber}
            jumpToMove={(mv) => this.jumpTo(mv)}
            sortAscending={this.state.sortHistoryAscending}
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