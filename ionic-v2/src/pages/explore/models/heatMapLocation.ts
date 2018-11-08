export interface IHeatMapLocation{
    city: string;
    stateOrCountry: string;
    count: number;
}

export class HeatMapLocation implements IHeatMapLocation {
    constructor(public city: string, public stateOrCountry: string, public count: number){}
}