class FacebookApi
{
  Login()
  {
    var self = this;
    return new Promise(function(resolve, reject)
      {
        try
        {
          FB.login(function(response)
          {
            var possibleError = self._checkForError(response);
            if(possibleError)
            {
              reject(possibleError);
            }
            else
            {
              resolve(response);
            }
          },
          {scope: 'user_location,email,user_age_range,user_friends,user_gender', return_scopes: true}); //user_hometown??
        }
        catch(exception)
        {
          reject(exception);
        }
      });
  }

  Logout()
  {
    var self = this;
    return new Promise(function(resolve, reject)
      {
        try
        {
          FB.logout(function(response)
          {
            var possibleError = self._checkForError(response);
            if(possibleError)
            {
              reject(possibleError);
            }
            else
            {
              resolve(response);
            }
          });
        }
        catch(exception)
        {
          reject(exception);
        }
      });
  }

  GetLoginStatus()
  {
    var self = this;
    return new Promise(function(resolve, reject)
    {
      try
      {
        FB.getLoginStatus(function(response) 
        {
          var possibleError = self._checkForError(response);
          if(possibleError)
          {
            reject(possibleError);
          }
          
          resolve(response);
        });
      }
      catch(exception)
      {
        reject(exception);
      }
    });
  }

  GetFriendList(userId)
  {
    return this._executeApiCall(`/${userId}/friends`, 'data');
  }

  GetUser(userId, accessToken)
  {
    return this._executeApiCall(`/${userId}?fields=location&access_token=${accessToken}`);
  }

  _executeApiCall(endPointStr, fieldStr = "")
  {
    var self = this;
    return new Promise(function(resolve, reject) 
    {
      try
      {
        FB.api(endPointStr, function (response) 
        {
          var possibleError = self._checkForError(response);
          if(possibleError)
          {
            reject(possibleError);
          }
          else
          {
            console.log(endPointStr + ' returned: ' + JSON.stringify(response));
            resolve(fieldStr ? response[fieldStr] : response);
          }
        });
      }
      catch(exception)
      {
        reject(exception);
      }
    });
  }

  _checkForError(response)
  {
    if(!response)
    {
      return new Error("Service did not return an appropriate response");
    }
    if(response.error)
    {
      return response.error;
    }

    return null;
  }
}

