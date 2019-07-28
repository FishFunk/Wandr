import { Location } from './user';

export interface ITrip {
    uid: string,
    facebook_uid: string,
    location: Location
    // going?: boolean,
    // wantsToGo?: boolean,
    // hasBeen?: boolean,
    business?: boolean,
    leisure?: boolean,
    moving?: boolean,
    // flying?: boolean,
    // driving?: boolean,
    startDate?: string,
    endDate?: string,
    notes?: string
    // photoUrl?: string
}