import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Country } from '../common/country';
import { State } from '../common/state';

@Injectable({
  providedIn: 'root',
})
export class ShopFormService {
  private readonly countriesUrl: string;
  private readonly statesUrl: string;

  constructor(private http: HttpClient) {
    const baseUrl: string = environment.apiUrl;
    this.countriesUrl = baseUrl + '/countries';
    this.statesUrl = baseUrl + '/states';
  }

  getCountries(): Observable<Country[]> {
    return this.http
      .get<CountryListResponse>(this.countriesUrl)
      .pipe(
        map((response: CountryListResponse) => response._embedded.countries),
      );
  }

  getStates(): Observable<State[]> {
    return this.http
      .get<StateListResponse>(this.statesUrl)
      .pipe(map((response: StateListResponse) => response._embedded.states));
  }

  getStatesForCountry(countryCode: string): Observable<State[]> {
    const url =
      this.statesUrl + '/search/findByCountryCode?code=' + countryCode;
    return this.http
      .get<StateListResponse>(url)
      .pipe(map((response) => response._embedded.states));
  }

  getCreditCardMonths(startMonth: number = 1): Observable<number[]> {
    let numberOfMonthsInAYear: number = 12;
    let data: number[] = [];
    for (let i: number = startMonth; i <= numberOfMonthsInAYear; i++) {
      data.push(i);
    }
    return of(data);
  }

  getCreditCardYears(): Observable<number[]> {
    const startYear: number = new Date().getFullYear();
    const endYear: number = startYear + 10;

    let data: number[] = [];
    for (let i: number = startYear; i <= endYear; i++) {
      data.push(i);
    }
    return of(data);
  }
}

interface CountryListResponse {
  _embedded: {
    countries: Country[];
  };
}

interface StateListResponse {
  _embedded: {
    states: State[];
  };
}
