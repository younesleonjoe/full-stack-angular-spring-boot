import { Injectable } from '@angular/core';
import { Product } from '../common/product';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ProductCategory } from '../common/product-category';
import { Page } from '../common/page';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // By default, Spring sends 20 items to make it send 100 items we need to add a query ?size=100 like below
  // private baseUrl = 'http://localhost:8080/api/products?size=100';
  private readonly productUrl: string;
  private readonly categoryUrl: string;

  /* Inject httpClient */
  constructor(private httpClient: HttpClient) {
    const baseUrl: string = environment.apiUrl;
    this.productUrl = baseUrl + '/products';
    this.categoryUrl = baseUrl + '/product-category';
  }

  getAllProducts(page?: Page): Observable<ProductListResponse> {
    const pageNumber: number = page?.number ?? 0;
    const pageSize: number = page?.size ?? 20;
    const url: string = `${this.productUrl}?page=${pageNumber}&size=${pageSize}`;
    return this.httpClient.get<ProductListResponse>(url);
  }

  getProductsByCategoryId(
    categoryId: number | undefined,
    page?: Page,
  ): Observable<ProductListResponse> {
    const pageNumber: number = page?.number ?? 0;
    const pageSize: number = page?.size ?? 20;
    const url: string = `${this.productUrl}/search/findByCategoryId?id=${categoryId}&page=${pageNumber}&size=${pageSize}`;
    return this.httpClient.get<ProductListResponse>(url);
  }

  private getProductsByName(
    name: string,
    page?: Page,
  ): Observable<ProductListResponse> {
    const pageNumber: number = page?.number ?? 0;
    const pageSize: number = page?.size ?? 20;
    const url = `${this.productUrl}/search/findByNameContaining?name=${name}&page=${pageNumber}&size=${pageSize}`;
    return this.httpClient.get<ProductListResponse>(url);
  }

  private getProductsByCategoryIdAndName(
    categoryId: number,
    name: string,
    page?: Page,
  ): Observable<ProductListResponse> {
    const pageNumber: number = page?.number ?? 0;
    const pageSize: number = page?.size ?? 20;
    const url = `${this.productUrl}/search/findByCategoryIdAndNameContainingIgnoreCase?id=${categoryId}&name=${name}&page=${pageNumber}&size=${pageSize}`;
    return this.httpClient.get<ProductListResponse>(url);
  }

  getProductById(productId: number): Observable<Product> {
    const url = `${this.productUrl}/${productId}`;
    return this.httpClient.get<Product>(url);
  }

  searchProducts(
    name: string,
    categoryId?: number,
    page?: Page,
  ): Observable<ProductListResponse> {
    categoryId = categoryId ?? -1;
    const hasCategoryId: boolean = categoryId != -1;
    const hasName: boolean = name.trim().length > 0;

    if (hasName && hasCategoryId)
      return this.getProductsByCategoryIdAndName(categoryId, name, page);
    if (hasName && !hasCategoryId) return this.getProductsByName(name, page);
    if (!hasName && hasCategoryId)
      return this.getProductsByCategoryId(categoryId, page);
    return this.getAllProducts(page);
  }

  getProductCategories(): Observable<ProductCategory[]> {
    const url = this.categoryUrl;
    return this.httpClient
      .get<ProductCategoryListResponse>(url)
      .pipe(map((response) => response._embedded.productCategory));
  }
}

/* Unwraps the JSON from Spring Data REST _embedded entry */
interface ProductListResponse {
  _embedded: {
    products: Product[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

interface ProductCategoryListResponse {
  _embedded: {
    productCategory: ProductCategory[];
  };
}
