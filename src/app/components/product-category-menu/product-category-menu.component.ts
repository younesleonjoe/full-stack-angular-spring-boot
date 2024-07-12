import { Component, OnInit } from '@angular/core';
import { ProductCategory } from '../../common/product-category';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-category-menu',
  templateUrl: './product-category-menu.component.html',
  styleUrl: './product-category-menu.component.css',
})
export class ProductCategoryMenuComponent implements OnInit {
  productCategories: ProductCategory[] = [];
  productOptionsCheckbox: boolean = false;
  optionIsMinimized: boolean = false;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.listProductCategories();
  }

  listProductCategories() {
    this.productService.getProductCategories().subscribe((data) => {
      this.productCategories = data;
    });
  }

  // Function to toggle the checkbox
  toggleCheckbox(): void {
    this.productOptionsCheckbox = !this.productOptionsCheckbox;
    this.toggleOptionMinimize();
  }

  async toggleOptionMinimize() {
    this.optionIsMinimized = this.productOptionsCheckbox
      ? true
      : await new Promise((resolve) => setTimeout(() => resolve(false), 150));
  }
}
