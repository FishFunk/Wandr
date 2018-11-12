import { Injectable } from '@angular/core';
import { User, IUser } from '../models/user';
import { MockDataGenerator } from './mockDataGenerator';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class WebDataService {
 
    constructor(private http: HttpClient) {
    }
 
  // Mock: Convert to read data from server
  async readUserFirstConnections(): Promise<IUser[]>{
    return await new Promise<IUser[]>((resolve, reject)=>{
      var generator = new MockDataGenerator();
      var usersJson = generator.generateMockJson(200);
      var users = JSON.parse(usersJson);
      resolve(users);
    });
  }

  // Mock: Convert to read data from server
  async readUserSecondConnections(): Promise<IUser[]>{
    return await new Promise<IUser[]>((resolve, reject)=>{
      var usersJson = this.getMockUserJson();
      var users = JSON.parse(usersJson);
      resolve(users);
    });
  }

  async readListOfCountryNames(){
    return new Promise((resolve, reject) => 
    {
      this.http.get('https://restcountries.eu/rest/v2/all?fields=name').subscribe(data => {
        resolve(data);
      },
      (error) => 
      {
        console.log(error);
        reject(error);
      });
    });
  }

  private getMockUserJson(){
    //**** Sample Lat Longs ****//
    // Houston TX (29.7604, -95.3698)
    // Austin TX (30.2672, -97.7431)
    // Washington DC (38.9072, -77.0369)
    // San Francisco (37.7749, -122.4194)
    // Toulouse, France (43.6047, 1.4442)
    // San Diego, CA (32.7157, -117.1611)

      var user1 = new User('1001', 'abcdefg', 'Daniel', 'Fishman', 27, 'Wassssupppp', 
      { stringFormat: 'San Diego, CA', latitude: '32.7157', longitude: '-117.1611' },
      ['1002','1003'],
      { host: true, tips: true, meetup: true, emergencyContact: false },
      '11/01/2018');

      var user2 = new User('1002', 'hijklmno', 'Steven', 'Wong', 31, 'Lorum ipsum. yadda yadda.', 
      { stringFormat: 'Washington DC', latitude: '38.9072', longitude: '-77.0369' },
      ['1001'],
      { host: false, tips: true, meetup: true, emergencyContact: false },
      '11/01/2018');

      var user3 = new User('1003', 'pqrstuv', 'Max', 'Augliere', 27, 'Be kind to one another!', 
      { stringFormat: 'Delray Beach, FL', latitude: '26.4615', longitude: '-80.0728' },
      ['1001'],
      { host: true, tips: true, meetup: true, emergencyContact: true },
      '11/01/2018');

      var user4 = new User('1004', 'pokesafpok', 'Spencer', 'Smith', 31, 'Ipsum porium babba ganoosh.', 
      { stringFormat: 'San Diego, CA', latitude: '32.7157', longitude: '-117.1611' },
      ['1001','1003'],
      { host: true, tips: true, meetup: true, emergencyContact: false },
      '11/01/2018');

      var user5 = new User('1005', 'hijncxkjncjjkno', 'Jimmy', 'Valentine', 22, 'Mary had a little lamb, little lamb!', 
      { stringFormat: 'Washington DC', latitude: '38.9072', longitude: '-77.0369' },
      ['1003'],
      { host: false, tips: true, meetup: false, emergencyContact: false },
      '11/01/2018');

      var user6 = new User('1006', 'ppqweohas823sjd', 'Ping', 'Pong', 35, 'I no speaka engrish very well...', 
      { stringFormat: 'Houston, TX', latitude: '29.7604', longitude: '-95.3698' },
      ['1002'],
      { host: true, tips: true, meetup: false, emergencyContact: false },
      '11/01/2018');

      var user7 = new User('1007', 'pqweua123456', 'Anita', 'Obasi', 27, 'Leave me alone. Jk.', 
      { stringFormat: 'Austin, TX', latitude: '30.2672', longitude: '-97.7431' },
      ['1001', '1003'],
      { host: true, tips: true, meetup: false, emergencyContact: false },
      '11/01/2018');

      var user8 = new User('1008', 'mzmzmzmzmzm', 'Emma', 'Hoover', 28, 'Sup. I dont like people very much.', 
      { stringFormat: 'Austin, TX', latitude: '30.2672', longitude: '-97.7431' },
      ['1001'],
      { host: true, tips: true, meetup: false, emergencyContact: false },
      '11/01/2018');


    return JSON.stringify([user1, user2, user3, user4, user5, user6, user7, user8]);
  }
}