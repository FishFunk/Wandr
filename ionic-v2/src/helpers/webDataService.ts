import { Injectable } from '@angular/core';
import { IUser } from '../models/user';
import { MockDataGenerator } from './mockDataGenerator';
import { Http, Headers, RequestOptions } from '@angular/http';
import { IChat, IMessage } from '../models/chat';
import { Observable, Subscription } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { _throw } from 'rxjs/observable/throw';
import { SaveProfileRequest } from '../models/saveProfileRequest';

@Injectable()
export class WebDataService {

    rootUrl: string = "https://us-central1-wanderlust-277a8.cloudfunctions.net/api";
    requestOptions: RequestOptions;
    mockDataGenerator: MockDataGenerator;
 
    constructor(private http: Http) {
      this.mockDataGenerator = new MockDataGenerator();
      let headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("Accept", "application/json");
      this.requestOptions = new RequestOptions({ headers: headers });
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

  saveProfile(data: SaveProfileRequest): Subscription{
    return this.constructHttpPost('saveProfile', data).subscribe();
  }

  private constructHttpPost(endPoint: string, requestData: any = {}): Observable<any>{
    let url = `${this.rootUrl}/${endPoint}`;

    return this.http.post(url, requestData, this.requestOptions);
  }

  // private constructHttpGet(endPoint: string): Observable<any>
  // {
  //   let url = `${this.rootUrl}/${endPoint}`;

  //   return this.http
  //     .get(url, this.requestOptions)
  //     .pipe(
  //       retry(2),
  //       catchError(this.errorHandler));

  // }

  // private constructHttpDelete(endPoint: string): Observable<any>
  // {
  //   let url = `${this.rootUrl}/${endPoint}`;

  //   return this.http
  //     .delete(url, this.requestOptions)
  //     .pipe(
  //       retry(2),
  //       catchError(this.errorHandler));
  // }

  // private errorHandler(error: any) {
  //   if (error.error instanceof ErrorEvent) {
  //     // A client-side or network error occurred. Handle it accordingly.
  //     console.error('An error occurred:', error.error.message);
  //   } else {
  //     // The backend returned an unsuccessful response code.
  //     // The response body may contain clues as to what went wrong,
  //     console.error(
  //       `Backend returned code ${error.status}, ` +
  //       `body was: ${error.error}`);
  //   }

  //   return _throw("HTTP Request Failed!");
  // };
}