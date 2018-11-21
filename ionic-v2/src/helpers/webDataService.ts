import { Injectable } from '@angular/core';
import { User, IUser } from '../models/user';
import { MockDataGenerator } from './mockDataGenerator';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { IChat, IMessage } from '../models/chat';
import { Observable } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { _throw } from 'rxjs/observable/throw';

@Injectable()
export class WebDataService {

    rootUrl: string = "https://<OUR ENDPOINT BASE>.cloudfunctions.net/api";
    requestOptions = { headers: new HttpHeaders() };
    mockDataGenerator: MockDataGenerator;
 
    constructor(private http: HttpClient) {
      this.mockDataGenerator = new MockDataGenerator();
      this.requestOptions.headers.append("content-type", "application/json; charset=utf-8");
    }
 
  // Mock: Convert to read data from server
  async readUserFirstConnections(): Promise<IUser[]>{
    return await new Promise<IUser[]>((resolve, reject)=>{
      var usersJson = this.mockDataGenerator.generateMockJson(100);
      var users = JSON.parse(usersJson);
      resolve(users);
    });
  }

  // Mock: Convert to read data from server
  async readUserSecondConnections(): Promise<IUser[]>{
    return await new Promise<IUser[]>((resolve, reject)=>{
      var usersJson = this.mockDataGenerator.generateMockJson(300);
      var users = JSON.parse(usersJson);
      resolve(users);
    });
  }

  // Mock: Convert to read data from server
  async readChatList(): Promise<IChat[]>{
    return new Promise<IChat[]>((resolve, reject)=>{
      var chatJson = this.mockDataGenerator.generateMockChatJson();
      var data = JSON.parse(chatJson);
      resolve(data);
    });
  }

  // Mock: Convert to read data from server
  async readMessages(): Promise<IMessage[]>{
    return new Promise<IMessage[]>((resolve, reject)=>{
      var messages = this.mockDataGenerator.generateMockMessageJson(10);
      var data = JSON.parse(messages);
      resolve(data);
    });
  }

  private constructHttpPost(endPoint: string, requestData: any = {}): Observable<any>
  {
    let url = `${this.rootUrl}/${endPoint}`;
    let body = JSON.stringify(requestData);

    return this.http
      .post(url, body, this.requestOptions)
      .pipe(
        retry(2),
        catchError(this.errorHandler));
      // .subscribe((data: any) => {
      //   resolve(data);
      // },
      // error => {
      //   this.logError(error);
      //   reject(error);
      // });
  }

  private constructHttpGet(endPoint: string): Observable<any>
  {
    let url = `${this.rootUrl}/${endPoint}`;

    return this.http
      .get(url, this.requestOptions)
      .pipe(
        retry(2),
        catchError(this.errorHandler));
      // .subscribe((data: any) => {
      //   resolve(data);
      // },
      // error => {
      //   this.logError(error);
      //   reject(error);
      // });

  }

  private constructHttpDelete(endPoint: string): Observable<any>
  {
    let url = `${this.rootUrl}/${endPoint}`;

    return this.http
      .delete(url, this.requestOptions)
      .pipe(
        retry(2),
        catchError(this.errorHandler));
      // .subscribe((data: any) => {
      //   resolve(data);
      // },
      // error => {
      //   this.logError(error);
      //   reject(error);
      // });

  }

  private errorHandler(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }

    return _throw("HTTP Request Failed!");
  };
}