export class Chat {
    constructor(
        public name: string,
        public lastMessage: string,
        public timeStamp: string){}
}

export class Message{
    constructor(
        public name: string,
        public message: string,
        public timeStamp: string){}
}

export interface IChat{
    name: string;
    lastMessage: string;
    timeStamp: string;
}

export interface IMessage{
    name: string;
    message: string;
    timeStamp: string;
}

