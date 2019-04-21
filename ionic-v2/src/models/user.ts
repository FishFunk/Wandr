export interface IUser{
    app_uid: string; 
    facebook_uid: string;
    first_name: string;
    last_name: string;
    email: string;
    bio: string;
    location: ILocation;
    friends: Array<IFacebookFriend>;
    roomkeys: string[];
    last_login: string;
    settings: IUserSettings;
    profile_img_url: string;
    interests: Array<ICheckboxOption>;
    lifestyle: Array<ICheckboxOption>;
    travel_info: string;
    onboardcomplete: boolean;
}

export interface ILocation{
    stringFormat: string; // TODO: Need to ensure consistent format and data validation
    latitude: string;
    longitude: string;
}

export interface IMutualConnectionInfo {
    app_uid: string;
    facebook_uid: string;
    first_name: string;
    last_name: string;
    profile_img_url: string;
}

export interface ICheckboxOption{
    label: string,
    iconClass: string
}

export interface IFacebookFriend{
    name: string;
    id: string;
}

export interface IUserSettings{
    notifications: boolean;
    //ghostMode: boolean;
    //thirdConnections: boolean;
}

export class Location implements ILocation{
    constructor(
        public stringFormat: string = '',
        public latitude: string = '',
        public longitude: string = '')
    {}
}

export class User implements IUser{
    constructor(
        public app_uid: string,
        public facebook_uid: string,
        public first_name: string,
        public last_name: string,
        public email: string,
        public location: ILocation,
        public friends: Array<IFacebookFriend>,
        public roomkeys: string[] = [],
        public last_login: string = "",
        public profile_img_url: string = "",
        public bio: string = "",
        public settings: any = {
            notifications: true
        },
        public lifestyle: Array<ICheckboxOption> = [],
        public interests: Array<ICheckboxOption> = [],
        public travel_info: string = "",
        public onboardcomplete: boolean = false)
        {}
}