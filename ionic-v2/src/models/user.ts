export interface IUser{
    app_uid: string; 
    facebook_uid: string;
    first_name: string;
    last_name: string;
    age: number;
    bio: string;
    location: ILocation;
    friends: Array<string>; // App specific UIDs
    services: IUserServices;
    last_login: string;
}

export interface ILocation{
    stateOrCountry: string;
    city: string;
}

export interface IUserServices{
    host: boolean;
    tips: boolean;
    meetup: boolean;
    emergencyContact: boolean;
}

export class User implements IUser{
    constructor(
        public app_uid: string,
        public facebook_uid: string,
        public first_name: string,
        public last_name: string,
        public age: number,
        public bio: string,
        public location: ILocation,
        public friends: Array<string>,
        public services: IUserServices,
        public last_login: string)
        {}
}