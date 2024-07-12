import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { ShopFormService } from '../../services/shop-form.service';
import { Country } from '../../common/country';
import { State } from '../../common/state';
import { CustomValidators } from '../../validators/custom-validators';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { Router } from '@angular/router';
import { Order } from '../../common/order';
import { CartItem } from '../../common/cart-item';
import { OrderItem } from '../../common/order-item';
import { Purchase } from '../../common/purchase';
import { UserService } from '../../services/user.service';

enum AddressType {
  ShippingAddress = 'shippingAddress',
  BillingAddress = 'billingAddress',
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit, OnDestroy {
  formGroup!: FormGroup;

  totalQuantity: number;
  totalPrice: number;

  creditCardYears: number[];
  creditCardMonths: number[];

  countries: Country[];
  shippingAddressStates: State[];
  billingAddressStates: State[];

  private shippingAddressSubscription?: Subscription;

  readonly AddressType;

  constructor(
    private formBuilder: FormBuilder,
    private shopFormService: ShopFormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private userService: UserService,
    private router: Router,
  ) {
    this.totalQuantity = 0;
    this.totalPrice = 0;
    this.creditCardYears = [];
    this.creditCardMonths = [];
    this.countries = [];
    this.shippingAddressStates = [];
    this.billingAddressStates = [];
    this.AddressType = AddressType;
  }

  ngOnInit(): void {
    const email: string | null = this.userService.fetchUserEmail();
    // Javascript Date object the month are zero-based
    // const startMonth: number = new Date().getMonth() + 1;
    this.shopFormService
      .getCreditCardMonths()
      .subscribe((data: number[]) => (this.creditCardMonths = data));
    this.shopFormService
      .getCreditCardYears()
      .subscribe((data: number[]) => (this.creditCardYears = data));
    this.formGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.notOnlyWhitespace,
        ]),
        lastName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.notOnlyWhitespace,
        ]),
        email: new FormControl(email ?? '', [
          Validators.required,
          Validators.pattern(
            '^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})$',
          ),
        ]),
      }),
      shippingAddress: this.formBuilder.group({
        country: new FormControl('', [Validators.required]),
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.notOnlyWhitespace,
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.notOnlyWhitespace,
        ]),
        state: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.notOnlyWhitespace,
        ]),
      }),
      billingAddress: this.formBuilder.group({
        country: new FormControl('', [Validators.required]),
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.notOnlyWhitespace,
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.notOnlyWhitespace,
        ]),
        state: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.notOnlyWhitespace,
        ]),
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.notOnlyWhitespace,
        ]),
        cardNumber: new FormControl('', [
          Validators.required,
          Validators.pattern('^[0-9]{16}$'),
        ]),
        securityCode: new FormControl('', [
          Validators.required,
          Validators.pattern('^[0-9]{3}$'),
        ]),
        expirationMonth: new FormControl('', [Validators.required]),
        expirationYear: new FormControl('', [Validators.required]),
      }),
    });

    // populate countries
    this.shopFormService
      .getCountries()
      .subscribe((data: Country[]) => (this.countries = data));

    this.reviewCardDetails();
  }

  ngOnDestroy(): void {
    this.shippingAddressSubscription?.unsubscribe();
  }

  get firstName() {
    return this.formGroup.get('customer.firstName');
  }

  get lastName() {
    return this.formGroup.get('customer.lastName');
  }

  get email() {
    return this.formGroup.get('customer.email');
  }
  get shippingAddressCountry() {
    return this.formGroup.get('shippingAddress.country');
  }
  get shippingAddressState() {
    return this.formGroup.get('shippingAddress.state');
  }
  get shippingAddressCity() {
    return this.formGroup.get('shippingAddress.city');
  }
  get shippingAddressStreet() {
    return this.formGroup.get('shippingAddress.street');
  }
  get shippingAddressZipCode() {
    return this.formGroup.get('shippingAddress.zipCode');
  }

  get billingAddressCountry() {
    return this.formGroup.get('billingAddress.country');
  }
  get billingAddressState() {
    return this.formGroup.get('billingAddress.state');
  }
  get billingAddressCity() {
    return this.formGroup.get('billingAddress.city');
  }
  get billingAddressStreet() {
    return this.formGroup.get('billingAddress.street');
  }
  get billingAddressZipCode() {
    return this.formGroup.get('billingAddress.zipCode');
  }

  get creditCardType() {
    return this.formGroup.get('creditCard.cardType');
  }

  get creditCardNameOnCard() {
    return this.formGroup.get('creditCard.nameOnCard');
  }

  get creditCardNumber() {
    return this.formGroup.get('creditCard.cardNumber');
  }

  get creditCardSecurityCode() {
    return this.formGroup.get('creditCard.securityCode');
  }

  get creditCardExpirationMonth() {
    return this.formGroup.get('creditCard.expirationMonth');
  }

  get creditCardExpirationYear() {
    return this.formGroup.get('creditCard.expirationYear');
  }

  onSubmit(): void {
    console.log('Handling the submit button');
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      console.log('The form is invalid');
      return;
    }
    // setup order
    const order = new Order();
    order.totalQuantity = this.totalQuantity;
    order.totalPrice = this.totalPrice;

    // get cart items
    const cartItems: CartItem[] = this.cartService.cartItems;

    // create orderItems from cartItems
    const orderItems: OrderItem[] = cartItems.map(
      (cartItem: CartItem) => new OrderItem(cartItem),
    );

    // setup purchase
    const purchase = new Purchase();

    // populate purchase - customer
    purchase.customer = this.formGroup.controls['customer'].value;

    // populate purchase - shipping address
    const shippingAddress = {
      ...this.formGroup.controls['shippingAddress'].value,
    };
    shippingAddress.country = { ...shippingAddress.country }.name;
    shippingAddress.state = { ...shippingAddress.state }.name;
    purchase.shippingAddress = shippingAddress;

    // populate purchase - billing address
    const billingAddress = {
      ...this.formGroup.controls['billingAddress'].value,
    };
    billingAddress.country = { ...billingAddress.country }.name;
    billingAddress.state = { ...billingAddress.state }.name;
    purchase.billingAddress = billingAddress;

    // populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // call REST API via the CheckoutService
    this.checkoutService.placeOrder(purchase).subscribe({
      next: (response) => {
        alert(
          `Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`,
        );
        // reset cart
        this.resetCart();
      },
      error: (error) => {
        alert(`There was an error: ${error.message}`);
      },
    });
    this.cartService.clearCart();
  }

  copyShippingAddressToBillingAddress(event: any): void {
    if (!event.target.checked) {
      this.shippingAddressSubscription?.unsubscribe();
      this.formGroup?.get('billingAddress')?.reset();
      // empty the select of states in billing address
      this.billingAddressStates = [];
      return;
    }

    this.formGroup
      ?.get('billingAddress')
      ?.patchValue(this.formGroup.get('shippingAddress')?.value, {
        emitEvent: false,
      });

    this.shippingAddressSubscription = this.formGroup
      ?.get('shippingAddress')
      ?.valueChanges.subscribe((shippingAddress) =>
        this.formGroup
          ?.get('billingAddress')
          ?.patchValue(shippingAddress, { emitEvent: false }),
      );

    // To populate the select options of states in billing address with the same options of states in shipping address
    this.billingAddressStates = this.shippingAddressStates;
  }

  handleMonthsAndYears(): void {
    const creditCardFormGroup = this.formGroup?.get('creditCard');
    if (creditCardFormGroup == undefined) {
      console.log('Credit Card Form Group Not Found');
      return;
    }

    // if the current year equals the selected year, then start with current month
    const currentYear: number = new Date().getFullYear();
    const currentMonth: number = new Date().getMonth() + 1;
    const selectedYear: number = Number(
      creditCardFormGroup!.value.expirationYear,
    );
    const startMonth: number = currentYear == selectedYear ? currentMonth : 1;
    this.shippingAddressSubscription = this.shopFormService
      .getCreditCardMonths(startMonth)
      .subscribe((data: number[]) => (this.creditCardMonths = data));
  }

  getStates(formGroupName: AddressType) {
    const formGroup = this.formGroup.get(formGroupName);
    const countryCode = formGroup?.value.country.code;
    this.shopFormService
      .getStatesForCountry(countryCode)
      .subscribe((data: State[]) => {
        if (formGroupName === AddressType.ShippingAddress) {
          this.shippingAddressStates = data;
        } else if (formGroupName === AddressType.BillingAddress) {
          this.billingAddressStates = data;
        }
        // select the first item by default
        formGroup?.get('state')?.setValue(data[0]);
      });
  }

  private reviewCardDetails() {
    this.cartService.totalPrice.subscribe(
      (price: number) => (this.totalPrice = price),
    );
    this.cartService.totalQuantity.subscribe(
      (quantity: number) => (this.totalQuantity = quantity),
    );
  }

  private resetCart() {
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalQuantity.next(0);
    this.cartService.totalPrice.next(0);

    // reset the form
    this.formGroup.reset();

    // navigate back to the project page
    this.router.navigateByUrl('/products');
  }
}
