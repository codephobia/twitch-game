import { GameBoard } from './game-board.model';

export class TicTacToe {
    private board: GameBoard;
    
    constructor() {
        this.board = this.newBoard();
    }

    private newBoard(): GameBoard {
        return [
            [0,0,0],
            [0,0,0],
            [0,0,0],
        ];
    }

    setMove(player: number, x: number, y: number): boolean {
        if (!this.board[y][x]) {
            this.board[y][x] = player;
            return true;
        }
        
        return false;
    }

    getMove(x: number, y: number): number {
        return this.board[y][x];
    }
}