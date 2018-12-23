export interface IUser{
    app_uid: string; 
    facebook_uid: string;
    first_name: string;
    last_name: string;
    age?: number;
    bio?: string;
    location: ILocation;
    friends: Array<IFacebookFriend>;
    services: IUserServices;
    roomkeys: string[];
    profile_img_url?: string;
    last_login: string;
    ghost_mode: boolean;
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

export interface IFacebookFriend{
    name: string;
    id: string;
}

export class Location implements ILocation{
    constructor(
        public stringFormat: string = '',
        public latitude: string = '',
        public longitude: string = '')
    {}
}

export class UserServices implements IUserServices{
    constructor(
        public host: boolean = false,
        public tips: boolean = false,
        public meetup: boolean = false,
        public emergencyContact: boolean = false)
        {}
}

export class User implements IUser{
    constructor(
        public app_uid: string,
        public facebook_uid: string,
        public first_name: string,
        public last_name: string,
        public location: ILocation,
        public friends: Array<IFacebookFriend>,
        public services: IUserServices,
        public roomkeys: string[],
        public last_login: string,
        public profile_img_url: string,
        public age: number,
        public bio: string = '',
        public ghost_mode: boolean = false)
        {}
}