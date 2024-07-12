import { Component, OnInit } from '@angular/core';
import { Product } from '../../common/product';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute } from '@angular/router';
import { Page } from '../../common/page';
import { CartItem } from '../../common/cart-item';
import { CartService } from '../../services/cart.service';
import {timeout} from "rxjs";

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;
  search: string = '';

  // Properties for pagination
  page: Page;
  maxVisibleNumberInPagination: number = 5;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
  ) {
    this.page = new Page(1, 10, 0);
  }

  ngOnInit() {
    this.initialize();
  }

  private initialize() {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  listProducts() {
    const hasKeyword: boolean = this.route.snapshot.paramMap.has('keyword');
    if (hasKeyword) {
      this.handleSearchProducts();
    } else {
      this.handleListProducts();
    }
  }

  private handleSearchProducts() {
    const keyword: string = this.route.snapshot.paramMap.get('keyword')!;

    // reset the page
    if (this.search != keyword) this.page.number = 1;
    this.search = keyword;

    this.page.number -= 1;
    // now search for the products using keyword
    this.productService
      .searchProducts(keyword, undefined, this.page)
      .subscribe(this.getNext());
  }

  private handleListProducts() {
    // check if "id" parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      // get the "id" param string. convert string to a number using the "+" symbol
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
    } else {
      // not category id available ... default to category id 1
      this.currentCategoryId = 1;
    }

    if (this.previousCategoryId != this.currentCategoryId) {
      this.page.number = 1;
    }

    this.previousCategoryId = this.currentCategoryId;

    // now get the products for the given category id
    this.page.number -= 1;
    this.productService
      .getProductsByCategoryId(this.currentCategoryId, this.page)
      .subscribe(this.getNext());
  }

  private getNext() {
    return (data: any) => {
      this.products = data._embedded.products;
      this.page = new Page(
        data.page.number + 1,
        data.page.size,
        data.page.totalElements,
      );
    };
  }

  updatePageSize(pageSize: string) {
    this.page = new Page(1, +pageSize, this.page.totalElements);
    this.listProducts();
  }

  addToCart(product: Product) {
    const cartItem: CartItem = new CartItem(product);
    this.cartService.addToCart(cartItem);
  }
}
