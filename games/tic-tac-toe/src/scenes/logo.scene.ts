import 'phaser';

/// <reference path="../phaser.d.ts" />

const LogoImg = require('../../assets/logo.png');

export class LogoScene extends Phaser.Scene {
    private logoSprite: Phaser.GameObjects.Sprite;

    constructor() {
        super({
            key: 'LogoScene'
        });
    }
    
    preload(): void {
        this.load.image('logo', LogoImg);
    }

    create(): void {
        const x: number = +this.game.config.width / 2;
        const y: number = +this.game.config.height / 2;
        
        this.logoSprite = this.add.sprite(x, y, 'logo');

        this.goToGame();
    }

    goToGame(): void {
        this.scene.start('GameScene');
    }

    update(): void {
        const x: number = +this.game.config.width / 2;
        const y: number = +this.game.config.height / 2;

        this.logoSprite.x = x;
        this.logoSprite.y = y;
    }
}