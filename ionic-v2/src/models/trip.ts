export interface ITrip {
    uid: string,
    facebook_uid: string,
    location: string
    going?: boolean,
    wantsToGo?: boolean,
    hasBeen?: boolean,
    business?: boolean,
    leisure?: boolean,
    moving?: boolean,
    flying?: boolean,
    driving?: boolean,
    startDate?: string,
    endDate?: string,
    photoUrl?: string
}