import { Location } from './user';

export interface ITrip {
    uid: string,
    facebook_uid: string,
    location: Location
    public: boolean,
    business?: boolean,
    leisure?: boolean,
    moving?: boolean,
    startDate?: string,
    endDate?: string,
    notes?: string
}

export interface IHoliday{
    name: string;
    date: string; // yyyy-mm-dd
    observed: string; // yyyy-mm-dd
    public: string
    country: string;
}