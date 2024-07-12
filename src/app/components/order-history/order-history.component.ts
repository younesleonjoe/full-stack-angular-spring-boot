import {Component, OnInit} from '@angular/core';
import { OrderHistory } from '../../common/order-history';
import { OrderHistoryService } from '../../services/order-history.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css',
})
export class OrderHistoryComponent implements OnInit {
  protected orderHistoryList: OrderHistory[];
  private storage: Storage;

  constructor(
    private orderHistoryService: OrderHistoryService,
    private userService: UserService,
  ) {
    this.orderHistoryList = [];
    this.storage = sessionStorage;
  }

  ngOnInit(): void {
    this.handleOrderHistory();
  }

  handleOrderHistory(): void {
    console.log('handleOrderHistory');
    // read the user's email address from browser storage
    const email: string | null = this.userService.fetchUserEmail();
    if (email == null) return;
    this.orderHistoryService
      .getOrderHistory(email)
      .subscribe((orderHistoryList) => {
        this.orderHistoryList = orderHistoryList;
        console.log(this.orderHistoryList);
      });
  }
}
