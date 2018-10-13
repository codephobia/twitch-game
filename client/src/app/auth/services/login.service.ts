import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';

@Injectable()
export class LoginService {
    private _ipc: IpcRenderer | undefined = void 0;

    constructor() {
        if (!window.require) {
            console.warn('Electron\'s IPC was not loaded');
            return;
        }

        try {
            this._ipc = window.require('electron').ipcRenderer;
        } catch (e) {
            throw e;
        }

        this._ipc.on('oauth-login-reply', this.login.bind(this));
    }

    loginWnd(): void {
        this._ipc.send('oauth-login');
    }

    private login(): void {
        console.log('login');
    }

    clearUserLoopBack(): void { }

    clearUserCookies(): void { }

    logout(): void { }
}
