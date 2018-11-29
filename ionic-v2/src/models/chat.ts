export class Chat implements IChat {
    constructor(
        public name: string,
        public lastMessage: string,
        public timeStamp: string,
        public unread: boolean, /// Dynamic value? Only applies to last message and depends on who sent it.
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
    name: string;
    lastMessage: string;
    timeStamp: string;
    unread: boolean;
    photoUrl?: string;
}

export interface IMessage{
    uid: string;
    name: string;
    message: string;
    timeStamp: string;
    photoUrl?: string;
}

