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
    profile_img_url?: string;
    last_login: string;
}

export interface ILocation{
    stringFormat: string; // TODO: Need to ensure consistent format and data validation
    latitude: string;
    longitude: string;
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
        public last_login: string,
        public profile_img_url?: string)
        {}
}