import { IChat } from "../models/chat";

export class Utils
{
    public static getUserRank(friendCount){
    
        if(friendCount < 10)
        {
          return "Newbie";
        }
        else if (friendCount > 10 && friendCount < 20)
        {
          return "Junior Triber";
        }
        else if (friendCount > 20 && friendCount < 40)
        {
          return "Tribe Leader";
        }
        else if (friendCount > 40 && friendCount < 50)
        {
          return "Top Triber";
        }
        else if (friendCount > 50)
        {
          return "Triber Master";
        }
    }

    public static getBadgeCount(userId: string, chats: IChat[]): number
    {
        let badgeCount = 0;
    
        chats.forEach((chatObj)=>{
          if(userId == chatObj.userA_id && chatObj.userA_unread) {
            badgeCount++;
          } else if (userId == chatObj.userB_id && chatObj.userB_unread) {
            badgeCount++;
          }
        });
        
        return badgeCount;
    }
}