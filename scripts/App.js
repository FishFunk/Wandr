class Main
{
  Initialize()
  {
    var userId = "";
    var accessToken = "";
    window.FbApi = new FacebookApi();

    FbApi.GetLoginStatus()
      .then((response)=>{
        userId = response.authResponse.userID;
        accessToken = response.authResponse.accessToken;

        if(response.status !== 'connected')
        {
          FbApi.Login();
        }

        //FbApi.GetUser(userId);
        FbApi.GetFriendList(userId)
          .then((friendList)=>console.log(`GetFriendList returned ${friendList.length} items`))
          .catch((error)=>console.log(error));
      })
      .catch((err) => console.log(err));
  }
}