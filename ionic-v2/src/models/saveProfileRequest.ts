import { User } from "./user";


export class SaveProfileRequest {
    public user: User
    public uid: string;
    public onboardcomplete: false;
}