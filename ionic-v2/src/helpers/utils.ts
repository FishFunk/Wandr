import { IChat } from "../models/chat";
import _ from 'underscore';
declare var is; // is-js

export class Utils
{
  public static formatGeocoderResults(data: google.maps.GeocoderResult[]){
    var country: string;
    var locality: string;
    var administrativeArea_1: string;
    data.forEach(val=>{
      val.address_components.forEach(comp=>{
        if(_.indexOf(comp.types, 'administrative_area_level_1') >= 0){
          administrativeArea_1 = comp.long_name;
        }
        if (_.indexOf(comp.types, 'locality') >= 0){
          locality = comp.long_name;
        }
        if (_.indexOf(comp.types, 'country') >= 0){
          country = comp.short_name;
        }
      });
    });

    if(country == 'US'){
      return `${locality}, ${administrativeArea_1}`;
    } else {
      return `${locality}, ${country}`;
    }
  }

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