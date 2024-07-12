import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../common/product';
import { Location } from '@angular/common';
import { CartItem } from '../../common/cart-item';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent implements OnInit {
  product: Product | undefined;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.handleProductDetails();
  }

  private handleProductDetails() {
    this.getProductDetails();
  }

  previousPage() {
    this.location.back();
  }

  private getProductDetails() {
    // get the "id" param string. convert string to a number using the "+" symbol
    const productId: number = +(this.route.snapshot.paramMap.get('id') ?? -1);
    if (productId == -1) {
      this.previousPage();
      return;
    }

    this.productService
      .getProductById(productId)
      .subscribe((data) => (this.product = data));
  }

  addToCart(product: Product) {
    const cartItem: CartItem = new CartItem(product);
    this.cartService.addToCart(cartItem);
  }
}
