import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private storage: Storage;

  constructor() {
    this.storage = sessionStorage;
  }

  persistUserEmail(email: string): void {
    this.storage.setItem('userEmail', email);
  }

  fetchUserEmail(): string | null {
    return this.storage.getItem('userEmail');
  }

  clearUserEmail(): void {
    this.storage.removeItem('userEmail');
  }
}
