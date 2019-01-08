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
}