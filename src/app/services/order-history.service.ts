import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {map, Observable} from 'rxjs';
import { OrderHistory } from '../common/order-history';

@Injectable({
  providedIn: 'root',
})
export class OrderHistoryService {
  private orderUrl: string = environment.apiUrl + '/orders';

  constructor(private http: HttpClient) {}

  getOrderHistory(email: string): Observable<OrderHistory[]> {
    const orderHistoryUrl: string = `${this.orderUrl}/search/findByCustomerEmail?email=${email}`;
    return this.http
      .get<OrderHistoryListResponse>(orderHistoryUrl)
      .pipe(map((response) => response._embedded.orders));
  }
}

interface OrderHistoryListResponse {
  _embedded: {
    orders: OrderHistory[];
  };
}
