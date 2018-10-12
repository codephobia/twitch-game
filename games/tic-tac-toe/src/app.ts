import 'phaser';
import '../sass/styles.scss';

/// <reference path="../phaser.d.ts" />

import { BootScene } from './scenes/boot.scene';
import { LogoScene } from './scenes/logo.scene';
import { GameScene } from './scenes/game.scene';

class App extends Phaser.Game {
    constructor(config: any) {
        super (config);
    }


}

function startApp(): void {
    let gameWidth: number = window.innerWidth * window.devicePixelRatio;
    let gameHeight: number = window.innerHeight * window.devicePixelRatio;

    let gameConfig: GameConfig = {
        width: gameWidth,
        height: gameHeight,
        parent: '',
        resolution: 1,
        scene: [BootScene, LogoScene, GameScene],
    };

    let app = new App(gameConfig);

    window.addEventListener('resize', () => {
        app.resize(window.innerWidth, window.innerHeight);
    });
}

window.addEventListener('game-init', () => {
    startApp();
});