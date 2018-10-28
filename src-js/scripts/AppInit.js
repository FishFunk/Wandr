class App
{
  constructor()
  {
    this.userId = "";
    this.accessToken = "";
    this.facebookApi = new FacebookApi();
  }

  Initialize()
  {
    var self = this;

    this.facebookApi.GetLoginStatus()
      .then((response)=>{
        self.userId = response.authResponse.userID;
        self.accessToken = response.authResponse.accessToken;

        if(response.status !== 'connected')
        {
          self.facebookApi.Login();
        }
      })
      .catch((err) => console.log(err));
  }

  OnClickLogin()
  {
    this.facebookApi.Login()
      .then((response)=>console.log(`Login returned ${JSON.stringify(response)}`))
      .catch((error)=>console.log(error));
  }

  OnClickLogout()
  {
    this.facebookApi.Logout()
      .then((response)=>console.log(`Logout returned ${JSON.stringify(response)}`))
      .catch((error)=>console.log(error));
  }

  OnClickGetFriendList()
  {
    this.facebookApi.GetFriendList(this.userId)
      .then((friendList)=>console.log(`GetFriendList returned ${friendList.length} items`))
      .catch((error)=>console.log(error));
  }

  OnClickGetUser()
  {
    this.facebookApi.GetUser(this.userId, this.accessToken)
      .then((user)=>console.log(`GetUser returned: ${JSON.stringify(user)}`))
      .catch((error)=>console.log(error));
  }
}