import { User, ILocation, IUserServices, IFacebookFriend } from '../models/user';
import { Chat, Message } from '../models/chat';
import { FacebookLoginResponse } from '@ionic-native/facebook';
import firebase from 'firebase';

export class MockDataGenerator
{
    private mockUserIDs = ["00001", "00002", "00003"];

    public getMockFacebookLoginResponse(): FacebookLoginResponse
    {
      return {
        status: "connected",
        authResponse: {
            session_key: true,
            accessToken: "cordova_not_available",
            expiresIn: 99999999999,
            sig: "",
            secret: "",
            userID: this.mockUserIDs[0]
        }};
    }

    public getMockUser(id?: string, maxCount = 10): User
    {
      return new User(
        id ? id : this.randomWord(), 
        id ? id : this.randomWord(), 
        this.randomFirstName(),
        this.randomLastName(),
        this.randomSentence(),
        this.randomLocation(),
        [this.randomFacebookFriend(1,maxCount), this.randomFacebookFriend(1,maxCount)],
        this.randomServices(),
        [],
        new Date().toString(),
        Math.round(Math.random()) ? '../../assets/avatar_man.png' : '../../assets/avatar_woman.png',
        this.randomSentence())
    }

    public getMockFacebookUser()
    {
      return { 
        name: `${this.randomFirstName()} ${this.randomLastName()}`,
        location: { name: "Washington, DC"}
      };
    }

    public getMockFirebaseResponse(): firebase.User
    {
      return <firebase.User> { uid: this.mockUserIDs[0] };
    }

    public generateMockJson(count: number): string
    {
        var mockUsers = [];
        for(var i=1; i <= count; i++)
        {
          var usr = this.getMockUser(i.toString(), count);
          mockUsers.push(usr);
        }
    
        return JSON.stringify(mockUsers);
      }

      public generateMockChatJson(count: number = 5): string{
        var chats = [];
        for(var i=0; i<count; i++)
        {
          var chat = new Chat(
            this.randomWord(),
            this.randomWord(),
            this.randomFirstName(),
            '',
            true,
            this.randomWord(),
            this.randomFirstName(),
            '',
            false,
            this.randomSentence(),
            new Date().getTime().toString());
            
          chats.push(chat);
        }

        return JSON.stringify(chats);
      }


      public generateMockMessageJson(count: number = 5): string{
        var messages = [];
        for(var i=0; i<count; i++)
        {
          var msg = new Message(
            this.randomWord(),
            this.mockUserIDs[this.randomNumber(0, this.mockUserIDs.length - 1)], 
            this.mockUserIDs[this.randomNumber(0, this.mockUserIDs.length - 1)],
            this.randomFirstName(), 
            this.randomSentence(), 
            new Date().toDateString());
          messages.push(msg);
        }

        return JSON.stringify(messages);
      }
    
      public randomLocation(){
        var locations = [
          { stringFormat: "Houston, TX", latitude: "29.7604", longitude: "-95.3698" },
          { stringFormat: "Austin, TX", latitude: "30.2672", longitude: "-97.7431" },
          { stringFormat: "Washington DC", latitude: "38.9072", longitude: "-77.0369" },
          { stringFormat: "San Francisco, CA", latitude: "37.7749", longitude: "-122.4194" },
          { stringFormat: "Toulouse, France", latitude: "43.6047", longitude: "1.4442" },
          { stringFormat: "San Diego, CA", latitude: "32.7157", longitude: "-117.1611" },
          { stringFormat: "San Jose, Costa Rica", latitude: "9.9281", longitude: "-84.0907" },
          { stringFormat: "Tokyo, Japan", latitude: "35.6895", longitude: "139.6917" },
          { stringFormat: "Delray Beach, FL", latitude: "26.4615", longitude: "-80.0728" },
          { stringFormat: "Honolulu, HI", latitude: "21.3069", longitude: "-157.8583" },
          { stringFormat: "Barcelona, Spain", latitude: "41.3851", longitude: "2.1734" }
        ]
        return <ILocation> locations[this.randomNumber(0,locations.length - 1)];
      }
    
      public randomServices(){
        return <IUserServices> {
          host: !!Math.round(Math.random()),
          tips: !!Math.round(Math.random()),
          meetup: !!Math.round(Math.random()),
          emergencyContact: !!Math.round(Math.random())
        };
      }
    
      public randomNumber(min, max){
        return Math.round(Math.random() * (max - min));
      }

      public randomFacebookFriend(idMin, idMax){
        return <IFacebookFriend>{
          id: this.randomNumber(idMin,idMax).toString(),
          name: this.randomFirstName()
        };
      }

      public randomBool(){
        return !!this.randomNumber(0, 1);
      }
    
      public randomWord(){
        var letters = "abcdefghijklmnopqrstuvwxyrz";
        var wordLength = this.randomNumber(2, 10);
        var word = "";
    
        for(var i=0; i < wordLength; i++){
          var idx = Math.random() * letters.length;
          word += letters.charAt(idx);
        }
    
        return word;
      }
    
      public randomSentence(){
        var sentence = "";
        var wordCount = this.randomNumber(1, 12);
        for(var i=0; i < wordCount; i++){
          sentence = sentence + this.randomWord() + " ";
        }
    
        return sentence;
      }

      public randomFirstName(){
        let names = [
          "Alex",
          "Andre",
          "Arnold",
          "Amanda",
          "Anna",
          "Aaron",
          "Ben",
          "Bill",
          "Carson",
          "Cecilia",
          "Cooper",
          "Carter",
          "David",
          "Daniel",
          "Dale",
          "Dee",
          "Daisy",
          "Eric",
          "Erica",
          "Erin",
          "Frank",
          "Fred",
          "Floyd",
          "Francisco",
          "Francesca",
          "Gina",
          "George",
          "Gabrielle",
          "Gabe",
          "Harry",
          "Henry",
          "Isaac",
          "Ian",
          "Isabel",
          "Janie",
          "Jane",
          "Jill",
          "Jack",
          "Jasmine",
          "Jerry",
          "Jack",
          "Jerry",
          "John",
          "Kathy",
          "Kerry",
          "Kenny",
          "Karl",
          "Kim",
          "Kelly",
          "Larry",
          "Linda",
          "Lindsey",
          "Luke",
          "Molly",
          "Mary",
          "Madison",
          "Maxwell",
          "Mark",
          "Morty",
          "Nick",
          "Perry",
          "Pierce",
          "Parker",
          "Patricia",
          "Que",
          "Rita",
          "Rose",
          "Reese",
          "Ryan",
          "Rick",
          "Sam",
          "Steven",
          "Samantha",
          "Susan",
          "Trey",
          "Tuan",
          "Timothy",
          "Thomas",
          "Udall",
          "Victor",
          "Victoria",
          "Venessa",
          "Walter",
          "William",
          "Xavier",
          "Yoyo",
          "Zizi"
        ];

      return names[this.randomNumber(0, names.length - 1)];
      }


    public randomLastName(){
      let names = [
        "Barker",
        "Johanssen",
        "Palmer",
        "Bynes",
        "Rienerston",
        "Ufberg",
        "Kissel",
        "Myers",
        "Wahl",
        "Goldberg",
        "Flinstone",
        "McJones",
        "Waters",
        "Simposon",
        "Smith",
        "Taylor",
        "Frankel",
        "Lee",
        "Wong",
        "Augliere",
        "Fishman",
        "Burbank",
        "Abemrod",
        "Appleseed",
        "Williams",
        "Stone",
        "Boyle",
        "Singer",
        "Pugarelli",
        "Hickman",
        "Reed",
        "Piralta",
        "Lohmann",
        "Mullen",
        "Gilchrist",
        "Cherepansky",
        "Peeples",
        "Terhune",
        "Ma"
      ];

      return names[this.randomNumber(0, names.length - 1)];
    }
}