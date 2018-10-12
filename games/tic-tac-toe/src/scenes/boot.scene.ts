import 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'BootScene'
        });
    }

    create(): void {
        this.scene.start('LogoScene');
    }
}