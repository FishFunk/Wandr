export class Constants {
    public static facebookUserIdKey = "facebookUserId";
    public static firebaseUserIdKey = "firebaseUserId";
    public static accessTokenKey = "accessToken";
    public static appBotId = "wandr_bot"; // defined in firebase functions index.ts

    // Flags
    public static hideMapTutorial = "hideMapTutorial";
    public static showIntro = "showIntro";

    // Database
    public static shareInfoKey = "shareInfo";

    // Events
    public static updateChatBadgeCountEventName = "onUpdateChatBadgeCountEvent";
    public static orderConnectionsByFirstName = "onOrderConnectionsByFirst";
    public static orderConnectionsByLastName = "onOrderConnectionsByLast";
    public static orderConnectionsByMutual = "onOrderConnectionsByMutual";
    public static refreshMapDataEventName = "onRefreshMapDataEvent";
    public static refreshProfileDataEvent = "onRefreshProfileDataEvent";
    public static refreshChatDataEvent = "onRefreshChatDataEvent";
    public static onSnapToMapLocationEvent = "onSnapToMapLocationEvent";
}