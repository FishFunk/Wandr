import { Injectable } from '@angular/core';
import { User, IUser } from '../models/user';

@Injectable()
export class WebDataService {
 
    constructor() {
 
    }
 
  // Mock: Convert to read data from server
  async readUserConnections(): Promise<IUser[]>{
    return await new Promise<IUser[]>((resolve, reject)=>{
      var usersJson = this.getMockUserJson();
      var users = JSON.parse(usersJson);
      resolve(users);
    });
  }

  private getMockUserJson(){
      var user1 = new User('1001', 'abcdefg', 'Daniel', 'Fishman', 27, 'Wassssupppp', 
      { city: 'San Diego', stateOrCountry: 'CA' },
      ['1002','1003'],
      { host: true, tips: true, meetup: true, emergencyContact: false },
      '11/01/2018');

      var user2 = new User('1002', 'hijklmno', 'Steven', 'Wong', 31, 'Lorum ipsum. yadda yadda.', 
      { city: 'Washington DC', stateOrCountry: 'DC' },
      ['1001'],
      { host: false, tips: true, meetup: true, emergencyContact: false },
      '11/01/2018');

      var user3 = new User('1003', 'pqrstuv', 'Max', 'Augliere', 27, 'Be kind to one another!', 
      { city: 'Delray Beach', stateOrCountry: 'FL' },
      ['1001'],
      { host: true, tips: true, meetup: true, emergencyContact: true },
      '11/01/2018');



    return JSON.stringify([user1, user2, user3]);
  }
}