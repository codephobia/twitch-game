import { Injectable } from "@angular/core";
import { IpcRenderer } from 'electron';

@Injectable()
export class LoginService {
  private _ipc: IpcRenderer | undefined = void 0;

  constructor() {
    if (window.require) {
      try {
        this._ipc = window.require('electron').ipcRenderer;
      } catch (e) {
        throw e;
      }
    } else {
      console.warn('Electron\'s IPC was not loaded');
    }
  }

  loginWnd(): void {
    this._ipc.on('oauth-login-reply', this.login.bind(this));
    this._ipc.send('oauth-login');
  }

  private login(): void {}

  clearUserLoopBack(): void {}

  clearUserCookies(): void {}

  logout(): void {}
}
