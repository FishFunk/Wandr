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

      case('Hazy sun'):
      icon = '<i class="fas fa-cloud-sun"></i>';
      break;

      case('Showers'):
      icon = '<i class="fas fa-cloud-rain"></i>';
      break;

      case('Light rain'):
      icon = '<i class="fas fa-cloud-rain"></i>';
      break;

      case('Thunderstorm'):
      icon = '<ion-icon name="thunderstorm"></ion-icon>';
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
    var country: string, 
    administrativeArea_long: string, 
    administrativeArea_short: string, 
    locality: string,
    political: string;

    var p = [];
    var l = [];
    var c = [];
    var a1 = []
    var a2 = [];

    data.address_components.forEach(comp=>{
      comp.types.forEach(type=>{
        if(type == 'political'){
          p.push(comp.long_name);
        }
        if(type == 'locality'){
          l.push(comp.long_name);
        }
        if(type == 'administrative_area_level_1'){
          a1.push(comp.short_name);
          a2.push(comp.long_name);
        }
        if(type == 'country'){
          c.push(comp.long_name);
        }
      });
    });

    political = _.first(p);
    locality = _.first(l);
    country = _.first(c);
    administrativeArea_short = _.first(a1);
    administrativeArea_long = _.first(a2);

    var formattedLocation = '';
    if(country == 'United States'){
      var descriptor = locality ? locality : political;
      if(descriptor){
        formattedLocation = `${descriptor}, ${administrativeArea_long}`;
      } else {
        formattedLocation = administrativeArea_long;
      }
    } else if (country == 'Canada'){
      if(locality){
        formattedLocation += `${locality}, `;
      }
      if(administrativeArea_short) {
        formattedLocation += `${administrativeArea_short}, `;
      }
      formattedLocation += country;
    }
    else{
      if(administrativeArea_long){
        formattedLocation += `${administrativeArea_long}, `;
      } else if(locality) {
        formattedLocation += `${locality}, `;
      }
      
      formattedLocation += country;
    }

    return formattedLocation;
  }

  public static convertLinkValuesInString(plainText: string): string{
    let formattedText = plainText;

    var textChunks = plainText.split(' ');
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