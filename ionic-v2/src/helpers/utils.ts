import { IChat } from "../models/chat";

export class Utils
{
    public static getUserRank(friendCount){
    
        // TODO: Need a ranking system that makes sense. 
        // Commented examples for if we used the "Birdy" name/brand concept.
        // https://icons8.com/icon/set/bird/color

        if(friendCount < 10)
        {
          return "Newbie"; // Egg / Nest
        }
        else if (friendCount > 10 && friendCount < 20)
        {
          return "Hotshot"; // Crow
        }
        else if (friendCount > 20 && friendCount < 40)
        {
          return "Hero"; // Kiwi
        }
        else if (friendCount > 40 && friendCount < 50)
        {
          return "Superstar"; // Dove
        }
        else if (friendCount > 50)
        {
          return "Champion"; // Eagle
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