import 'phaser';
import { TicTacToe } from '../models/tic-tac-toe.model';

const BoardImg = require('../../assets/game-board.png');
const BlankImg = require('../../assets/blank.png');
const GoldImg = require('../../assets/gold.png');
const SilverImg = require('../../assets/silver.png');

export class GameScene extends Phaser.Scene {
    private ticTacToe: TicTacToe;
    private tiles: Phaser.GameObjects.Sprite[][] = [];
    private moves: string[] = ['blank', 'silver', 'gold'];
    private player: number = 1;
    
    constructor() {
        super({
            key: 'GameScene'
        });

        this.ticTacToe = new TicTacToe();
    }

    preload(): void {
        this.load.image('board', BoardImg);
        this.load.image('blank', BlankImg);
        this.load.image('gold', GoldImg);
        this.load.image('silver', SilverImg);
    }

    create(): void {
        const boardSize: number = 236;
        
        this.add.image(boardSize / 2, boardSize / 2, 'board');

        this.drawBoard();

        this.input.on('gameobjectup', this.clickHandler, this);
    }

    update(): void {
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                let move = this.ticTacToe.getMove(x, y);
                this.tiles[y][x].setTexture(this.moves[move]);
            }
        }
    }

    drawBoard(): void {
        const padding: number = 10;
        const width: number = 72;
        const height: number = width;
        
        for (let y = 0; y < 3; y++) {
            this.tiles[y] = [];

            for (let x = 0; x < 3; x++) {
                let posX: number = (x * width) + (width / 2) + (x * padding);
                let posY: number = (y * height) + (height / 2) + (y * padding);

                let sprite = this.add.sprite(posX, posY, 'blank').setInteractive();
                sprite.setData('tileX', x);
                sprite.setData('tileY', y);

                this.tiles[y][x] = sprite;
            }
        }
    }

    clickHandler(pointer: any, sprite: Phaser.GameObjects.Sprite): void {
        sprite.input.enabled = false;
        this.ticTacToe.setMove(this.player, sprite.getData('tileX'), sprite.getData('tileY'));
        this.player = (this.player === 1) ? 2 : 1;
    }
}