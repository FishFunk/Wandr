import { IChat } from "../models/chat";
import _ from 'underscore';
import { IUser } from "../models/user";
declare var is; // is-js

export class Utils
{
  public static getWeatherIcon(weather: string){
    let icon;
    switch(weather){
      case('Windy'):
      icon = '<i class="fas fa-wind"></i>'
      break;

      case('Cloudy'):
      icon = '<i class="fas fa-cloud"></i>';
      break;
      
      case('Some clouds'):
      icon = '<i class="fas fa-cloud"></i>';
      break;

      case('Mostly cloudy'):
      icon = '<i class="fas fa-cloud"></i>';
      break;

      case('Partly cloudy'):
      icon = '<i class="fas fa-cloud-moon"></i>';
      break;

      case('Clouds and sun'):
      icon = '<i class="fas fa-cloud-sun"></i>';
      break;

      case('Sunny'):
      icon = '<i class="fas fa-sun"></i>';
      break;

      case('Mostly sunny'):
      icon = '<i class="fas fa-cloud-sun"></i>';
      break;

      case('Partly sunny'):
      icon = '<i class="fas fa-cloud-sun"></i>';
      break;

      case('Showers'):
      icon = '<i class="fas fa-cloud-rain"></i>';
      break;

      case('Light rain'):
      icon = '<i class="fas fa-cloud-rain"></i>';
      break;

      case('Rain'):
      icon = '<i class="fas fa-cloud-showers-heavy"></i>';
      break;

      case('Snow'):
      icon = '<i class="far fa-snowflake"></i>';
      break;

      case('Smog'):
      icon = '<i class="fas fa-smog"></i>';
      break;

      case('Mostly clear'):
      icon = '<i class="fas fa-cloud-moon"></i>';
      break;

      case('Clear'):
      icon = '<i class="fas fa-moon"></i>';
      break;
    }

    return icon;
  }

  public static formatGeocoderResults(data: google.maps.GeocoderResult){
    var country: string;
    var locality: string;
    var administrativeArea_1: string;
    data.address_components.forEach(comp=>{
      if(_.indexOf(comp.types, 'administrative_area_level_1') >= 0){
        administrativeArea_1 = comp.long_name;
      }
      if (_.indexOf(comp.types, 'locality') >= 0){
        locality = comp.long_name;
      }
      if (_.indexOf(comp.types, 'country') >= 0){
        country = comp.long_name;
      }
    });

    if(country == 'United States'){
      if(locality && administrativeArea_1){
        return `${locality}, ${administrativeArea_1}`;
      }
      else {
        return administrativeArea_1;
      }
    } else {
      if(locality && country){
        return `${locality}, ${country}`;
      } else {
        return country;
      }
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

  public static getPlainUserObject(userData: IUser){
    return <IUser> {
      app_uid: userData.app_uid, 
      facebook_uid: userData.facebook_uid,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email || "",
      bio: userData.bio || "",
      location: Object.assign({}, userData.location),
      friends: userData.friends.map((obj)=> {return Object.assign({}, obj)}),
      interests: userData.interests || [],
      lifestyle: userData.lifestyle || [],
      roomkeys: userData.roomkeys || [],
      last_login: userData.last_login || new Date().toString(),
      settings: Object.assign({}, userData.settings),
      profile_img_url: userData.profile_img_url || ""
    }
  }
}