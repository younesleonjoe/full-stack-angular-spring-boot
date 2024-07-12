import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  cartItems: CartItem[] = [];

  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  private storage: Storage;

  constructor() {
    // reference storage to the web browser local storage
    this.storage = localStorage; /* sessionStorage; */
    this.readDataFromStorage();
  }

  private readDataFromStorage(): void {
    // read data from storage
    const data = JSON.parse(this.storage.getItem('cartItems') ?? 'null');
    if (data === null) return;
    this.cartItems = data;
    // compute totals based on the data that is read from storage
    this.computeCartTotals();
  }

  addToCart(cartItem: CartItem): void {
    const existingCartItem: CartItem | undefined = this.cartItems.find(
      (item: CartItem) => item.id === cartItem.id,
    );

    if (existingCartItem != undefined) existingCartItem.quantity++;
    else this.cartItems.push(cartItem);

    this.computeCartTotals();
  }

  removeFromCart(cartItem: CartItem, removeFull: boolean = false): void {
    const existingCartItem: CartItem | undefined = this.cartItems.find(
      (item) => item.id === cartItem.id,
    );

    if (existingCartItem == undefined) return;

    existingCartItem.quantity--;
    if (removeFull || existingCartItem.quantity <= 0)
      this.removeCartItem(cartItem);

    this.computeCartTotals();
  }

  private removeCartItem(cartItem: CartItem): void {
    this.cartItems.splice(this.cartItems.indexOf(cartItem), 1);
  }

  computeCartTotals(): void {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (const cartItem of this.cartItems) {
      totalPriceValue += cartItem.quantity * cartItem.unitPrice;
      totalQuantityValue += cartItem.quantity;
    }

    // Publish the new values ... all subscribers will receive the new data
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);
    this.persistCartItems();
  }

  private persistCartItems(): void {
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }

  clearCart(): void {
    this.storage.removeItem('cartItems');
  }
}
