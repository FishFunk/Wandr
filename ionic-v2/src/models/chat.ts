export class Chat implements IChat {
    constructor(
        public roomkey: string,
        public userA_id: string,
        public userA_name: string,
        public userA_photoUrl: string,
        public userB_id: string,
        public userB_name: string,
        public userB_photoUrl: string,
        public lastMessage: string,
        public timestamp: string){}
}

export class Message implements IMessage {
    constructor(
        public uid: string,
        public name: string,
        public message: string,
        public timestamp: string){}
}

export interface IChat{
    roomkey: string;
    userA_id: string;
    userA_name: string;
    userA_photoUrl: string;
    userB_id: string;
    userB_name: string;
    userB_photoUrl: string;
    lastMessage: string;
    timestamp: string;
}

export interface IMessage{
    uid: string;
    name: string;
    message: string;
    timestamp: string;
}

