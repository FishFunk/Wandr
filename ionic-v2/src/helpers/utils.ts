import { IChat } from "../models/chat";
declare var is; // is-js

export class Utils
{
  public static convertLinkValuesInString(plainText: string): string{
    let formattedText = plainText;

    var textChunks = plainText.split(RegExp('\b[^\s]+\b'));
    textChunks.forEach(textStr=>{
      if(is.url(textStr)){
        formattedText = formattedText.replace(textStr, `<a href='${textStr}'>${textStr}</a>`);
      }
      else if (is.email(textStr)){
        formattedText = formattedText.replace(textStr, ` <a href='mailto:${textStr}'>${textStr}</a>`);
      }
      else if (is.eppPhone(textStr) || is.nanpPhone(textStr)){
        formattedText = formattedText.replace(textStr, ` <a href='tel:${textStr}'>${textStr}</a>`);
      }
    });
    
    return formattedText;
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