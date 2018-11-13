import { User, ILocation, IUserServices } from '../models/user';

export class MockDataGenerator
{
    public generateMockJson(count: number): string
    {
        var mockUsers = [];
        for(var i=1; i <= count; i++)
        {
          var usr = new User(
            i.toString(), 
            i.toString(), 
            this.randomFirstName(),
            this.randomLastName(),
            this.randomNumber(18, 99),
            this.randomSentence(),
            this.randomLocation(),
            [this.randomNumber(1,count).toString(), this.randomNumber(1,count).toString()],
            this.randomServices(),
            '11/01/2018',
            Math.round(Math.random()) ? '../../assets/avatar_man.png' : '../../assets/avatar_woman.png')
    
            mockUsers.push(usr);
        }
    
        return JSON.stringify(mockUsers);
      }
    
      private randomLocation(){
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
    
      private randomServices(){
        return <IUserServices> {
          host: !!Math.round(Math.random()),
          tips: !!Math.round(Math.random()),
          meetup: !!Math.round(Math.random()),
          emergencyContact: !!Math.round(Math.random())
        };
      }
    
      private randomNumber(min, max){
        return Math.round(Math.random() * (max - min));
      }
    
      private randomWord(){
        var letters = "abcdefghijklmnopqrstuvwxyrz";
        var wordLength = this.randomNumber(2, 10);
        var word = "";
    
        for(var i=0; i < wordLength; i++){
          var idx = Math.random() * letters.length;
          word += letters.charAt(idx);
        }
    
        return word;
      }
    
      private randomSentence(){
        var sentence = "";
        var wordCount = this.randomNumber(1, 12);
        for(var i=0; i < wordCount; i++){
          sentence = sentence + this.randomWord() + " ";
        }
    
        return sentence;
      }

      private randomFirstName(){
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


    private randomLastName(){
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