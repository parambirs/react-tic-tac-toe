import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';

interface SquareProps {
    value: string
    onClick: () => void
    winner: boolean
}

function Square(props: SquareProps) {
    return (
        <button className={props.winner ? 'winnersquare' : 'square'} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

interface BoardProps {
    squares: string[],
    onClick: (i: number) => void,
    winningSquares: number[]
}

class Board extends React.Component<BoardProps> {

    renderSquare(i: number, winner: boolean) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                winner={winner}
            />
        );
    }

    render() {
        const elements = [];

        const squares = [];
        for (let i = 0; i < 3; i++) {
            const row = [];
            for (let j = 0; j < 3; j++) {
                row.push(this.renderSquare(i * 3 + j, this.props.winningSquares.includes(i * 3 + j)));
            }
            squares.push(<div key={i} className="board-row">{row}</div>)
        }
        return (
            <div>{squares}</div>
        );
    }

}

interface GameProps { }

interface GameState {
    history: { squares: string[], location: string }[],
    stepNumber: number,
    xIsNext: boolean,
    sortAscending: boolean
}

class Game extends React.Component<GameProps, GameState> {
    constructor(props: GameProps) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                location: ""
            }],
            stepNumber: 0,
            xIsNext: true,
            sortAscending: true
        }
    }

    handleClick(i: number) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }

        const row = Math.floor(i / 3);
        const col = i % 3;
        const location = `(${col}, ${row})`;

        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
                location: location
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
    }

    jumpTo(step: number) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
    }

    toggleAscending() {
        this.setState({
            sortAscending: !this.state.sortAscending
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);
        const full = isFull(current.squares);

        const moves = history.map((step, move) => {
            const location = history[move].location;
            let desc = move ? `Go to move #${move} - ${location}` : 'Go to game start';

            return (
                <li key={move}>
                    <button
                        className={move === this.state.stepNumber ? 'move-list-item-selected' : ''}
                        onClick={() => this.jumpTo(move)}>
                        {desc}
                    </button>
                </li>
            );
        });

        if (!this.state.sortAscending) {
            moves.reverse();
        }

        let status;
        if (winner) {
            status = `Winner: ${winner.symbol}`;
        } else if(full) {
            status = `It's a draw!`;
        } else {
            status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        winningSquares={winner ? winner.squares : []}
                    />
                </div>
                <div className="game-info">
                    <div>
                        <button onClick={() => this.toggleAscending()}>
                            {this.state.sortAscending ? "Show Descending" : "Show Ascending"}
                        </button>
                    </div>
                    <div>{status}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// class ShoppingList extends React.Component<{name: string}> {
//     render() {
//         return (
//             <div className="shopping-list">
//                 <h1>Shopping List for {this.props.name}</h1>
//                 <ul>
//                     <li>Instagram</li>
//                     <li>WhatsApp</li>
//                     <li>Oculus</li>
//                 </ul>
//             </div>
//         );
//     }
// }

// ===============================================
interface Winner {
    symbol: string,
    squares: number[]
}

function isFull(squares: string[]): boolean {
    return squares.every(s => s != null);
}

function calculateWinner(squares: string[]): Winner | null {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] == squares[b] && squares[a] == squares[c]) {
            return {
                symbol: squares[a],
                squares: [a, b, c]
            };
        }
    }
    return null;
}

ReactDOM.render(
    <Game />,
    // <ShoppingList name="Mark" />,
    document.getElementById('root')
);