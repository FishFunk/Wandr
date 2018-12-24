export class Chat implements IChat {
    constructor(
        public roomkey: string,
        public userA_id: string,
        public userA_name: string,
        public userB_id: string,
        public userB_name: string,
        public lastMessage: string,
        public timeStamp: string,
        public photoUrl?: string){}
}

export class Message implements IMessage {
    constructor(
        public uid: string,
        public name: string,
        public message: string,
        public timeStamp: string,
        public photoUrl?: string){}
}

export interface IChat{
    roomkey: string;
    userA_id: string;
    userA_name: string;
    userB_id: string;
    userB_name: string;
    lastMessage: string;
    timeStamp: string;
    photoUrl?: string;
}

export interface IMessage{
    uid: string;
    name: string;
    message: string;
    timeStamp: string;
    photoUrl?: string;
}

