  // Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.4/firebase-app.js";
import * as rtdb from "https://www.gstatic.com/firebasejs/9.9.4/firebase-database.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCWfG1s7-NeXjfLHfTrtz_rXJ1QUgqFwT4",
    authDomain: "amogus-a0de7.firebaseapp.com",
    databaseURL: "https://amogus-a0de7-default-rtdb.firebaseio.com",
    projectId: "amogus-a0de7",
    storageBucket: "amogus-a0de7.appspot.com",
    messagingSenderId: "577140357130",
    appId: "1:577140357130:web:5555507977ab4ea3ae07f3"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
let db = rtdb.getDatabase(app);
let tweetRef = rtdb.ref(db, "/tweets");

$("#user-search").hide();
$("#editUser").hide();

firebase.initializeApp(firebaseConfig);
firebase.auth().onAuthStateChanged(user => {
  console.log(user);
  if(!user){
    renderLogin();
  }
  else{
    $("#login").hide();
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has("user")){
      renderPage(user)
    }
  } 
});

let returnFunc = function(){
  const myParams = new URLSearchParams(window.location.search);
  myParams.delete('user');
  window.location.search = myParams;
}


let renderLogin = ()=>{
  $("#login").show();
  $("#mainpage").hide();
  
  $("#login").on("click", ()=>{
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
  });
}

let renderPage = (loggedIn)=>{ 
  $("#mainpage").show();
  $("#showTweets").hide();
  var userRef = firebase.database().ref().child("/users").child(loggedIn.uid);
  userRef.get().then((ss) => {
    let userData = ss.val();
    if(!userData){
      let username = loggedIn.displayName;
      $("#logged-user").prepend(`
        <p>You are logged in as: ${username}</p>
      `);
    } 
    else{
      $("#logged-user").prepend(`
        <p>You are logged in as: ${userData.handle}</p>
      `);
    }
  });
  
  $("#edit-butt").on("click", ()=>{
    renderEdit(loggedIn);
  });
  $("#logout").on("click", ()=>{
	  firebase.auth().signOut();
  });
  $("#tweetbutt").on("click", evt=>{
    sendTweet();
  });
  $("#search-butt-main").on("click", ()=>{
    searchUser();
  });
  $("#tweet").on( 'keydown', function ( evt ) {
    if( evt.keyCode == 13 )
      //alert("Sending Tweet: "+ $("#tweet").val());
      sendTweet(); 
  });
  
  $("#search-box").on('keydown', function ( evt ) {
    if( evt.keyCode == 13 )
      //alert("Searching User: "+$("#search-box").val());
      searchUser(); 
  });
  
  rtdb.onChildAdded(tweetRef, (ss)=>{
    let tObj = ss.val();
    renderTweet(tObj, ss.key, "alltweets");
}); 
}

let renderEdit = (user) =>{
  $("#mainpage").hide();
  $("#editUser").show();
  
  $("#editUser").html(`
    <h2>Here is your info:</h2>
    <div id="userImg"></div>
    <div id="username"></div>
    <input id="newHandle" placeholder="New Handle Here"/><button id="handle-butt">Update Handle</button>
    <input id="newImg" placeholder="Image Link Here"/><button id="img-butt">Update Image</button>
    <button id="leave-edit">Go Back</button>
  `);
  var userRef = firebase.database().ref().child("/users").child(user.uid);
  userRef.get().then((ss) => {
    let userData = ss.val();
    if(!userData){
      alert("there is none");
    } 
    else{
      $("#userImg").html(`<img id="userPFP" src="${userData.pic}"></img>`);
      $("#username").html(`<p>Username: ${userData.handle} <p>`);
    }
  });

  $("#handle-butt").on("click", ()=>{
    userRef.child("handle").set($("#newHandle").val());
    renderEdit(user);
  });
  $("#img-butt").on("click", ()=>{
    userRef.child("pic").set($("#newImg").val());
    renderEdit(user);
  });
  $("#newHandle").on( 'keydown', function ( evt ) {
    if( evt.keyCode == 13 ){
      //alert("hey");
      userRef.child("handle").set($("#newHandle").val());
      renderEdit(user);
    }
  });
  
  $("#newImg").on('keydown', function ( evt ) {
    if( evt.keyCode == 13 ){
      //alert("hey");
      userRef.child("pic").set($("#newImg").val());
      renderEdit(user);
    }
  });

  $("#leave-edit").on("click", () =>{
    history.go(0);
  });

}

let renderSearch = (user)=>{
  
  firebase.database().ref("users").on('value', function(snap){
    var key = null;
    snap.forEach(function(childNodes){
      //console.log(childNodes.val().handle);
      //console.log(user==childNodes.val().handle);
      if(user==childNodes.val().handle){
        key = childNodes.key;
      }
  });
  if(!key){
    $("#searched-info").html(`<p>Unable to find User: ${user} </p>`);
  }
  else{
    renderUserTweets(key);  
  }
  $("#mainpage").hide();
  $("#user-search").show();
   });
 $("#ret-butt").click(returnFunc);
 $("#search-butt-search").on("click", ()=>{
  let youruser = $("#search-box-search").val();
  if (!!youruser){
    const myParams = new URLSearchParams(window.location.search);
    myParams.set('user', youruser);
    window.location.search = myParams;
    renderSearch(youruser);
  }
  
});
} 

let renderUserTweets = (userKey)=>{
  let loggedIn = firebase.auth().currentUser;
  const dbRef = firebase.database().ref();
  
  dbRef.child("users").child(userKey).get().then((ss) => {
    let userData = ss.val();
    let hey = "im a variable";
    console.log(userData);
    $("#searched-info").html(`
      <p>We found the user: ${userData.handle}</p>
      <p>Here's their tweets:</p>
    `);
    
    if(!userData.tweets){
      console.log("they got none");
      $("#userTweets").append(`
        <p>This user has no tweets!</p>
      `);
    }
    else{
      for(var tweetID of Object.keys(userData.tweets)){
        
        dbRef.child("tweets").child(tweetID).get().then((ss) =>{
          
          var tObj = ss.val();
          renderTweet(tObj, ss.key, "userTweets");
        });
      }
    }
    
});
}

let renderTweet = (tObj, uuid, location)=>{
  let userID = tObj.authorID;
  var handle = "Default User";
  var image = "https://thumbs.dreamstime.com/b/default-avatar-profile-trendy-style-social-media-user-icon-187599373.jpg";
  var userRef = firebase.database().ref().child("/users").child(userID);
  console.log("Rendering Tweet"); 
  userRef.get().then((ss) => {
    let userData = ss.val();
    //console.log(userData);
    if(!userData){
      //console.log("null");
    } 
    else{
      //console.log("found");
      handle = userData.handle;
      $("#userHandle-"+uuid).text(handle);
      image = userData.pic;
      //console.log(image)
      $("#userImg-"+uuid).html(`<img src="${image}" id="userImg" class="img-fluid rounded-start" referrerpolicy="no-referrer" alt="..."></img>`);
    }
    $("#"+location).prepend(`
  <div class="card mb-3 tweet" data-uuid="${uuid}" data-user-uid="${userID}" style="max-width: 600px;">
    <div class="row g-0">
      <div id="userImg-${uuid}" class="col-md-4">
        <img src="${image}" class="twtImg img-fluid rounded-start" referrerpolicy="no-referrer" alt="..."></img>
      </div>
      <div class="col-md-8">
        <div class="card-body">
          <h5 class="card-title" id="userHandle-${uuid}">${handle}</h5>
            <p class="card-text">${tObj.content}</p>
            <p class="card-text">Tweeted at ${new Date(tObj.timestamp).toLocaleString()}</small></p>
            <p class="card-text" id="likeRTtext-${uuid}">Likes: ${tObj.likes} Retweets: ${tObj.retweets}</p>
          <div id="buttons-${uuid}">
            <button id="likebutton" href="#" class="btn btn-danger likebutton" data-uuid="${uuid}" data-user-uid="${userID}">Like</button>
            <button id="retweetbutton" href="#" class="btn btn-success retweetbutton" data-uuid="${uuid}" data-user-uid="${userID}">Retweet</button>
            
          </div>
        </div>
      </div>
    </div>
  </div>
  `);
  const loggedIn = firebase.auth().currentUser; 
  $(".likebutton").off("click");
  $(".likebutton").on("click", (evt)=>{
    let ID = $(evt.currentTarget).attr("data-uuid");
    let tweetIDRef = firebase.database().ref("/tweets").child(ID);
    toggleLike(tweetIDRef, loggedIn.uid);
  });
  
  $(".retweetbutton").off("click");
  $(".retweetbutton").on("click", (evt)=>{
    let ID = $(evt.currentTarget).attr("data-uuid");
    let tweetIDRef = firebase.database().ref("/tweets").child(ID);
    toggleRetweet(tweetIDRef, loggedIn.uid);
  });

  var user = firebase.auth().currentUser;
  if(user.uid==userID){
    $("#buttons-"+uuid).append(`
      <button id="deletebutton" href="#" class="btn btn-dark deletebutton" data-uuid="${uuid}" data-user-uid="${userID}">Delete Tweet</button>
    `);
  }
  $(".deletebutton").off("click");
  $(".deletebutton").on("click", (evt)=>{
    let tweetID = $(evt.currentTarget).attr("data-uuid");
    let authorID = $(evt.currentTarget).attr("data-user-uid");
    console.log(evt.currentTarget);
    $("div[data-uuid=" + tweetID+ "]").remove();
    let tweetIDRef = rtdb.ref(db, "/tweets/"+tweetID);
    rtdb.remove(tweetIDRef); 
    let authorIDRef = rtdb.ref(db, "/users/"+authorID+"/tweets/"+tweetID);
    rtdb.remove(authorIDRef); 

  }); 
  });
}

let toggleLike = (tweetRef, uid)=> {
  tweetRef.transaction((tObj) => {
    console.log(tObj);
    if (tObj) {
      if (tObj.likes && tObj.liked_by_user[uid]) {
        tObj.likes--;
        tObj.liked_by_user[uid] = null;
      } else {
        tObj.likes++;
        if (!tObj.liked_by_user) {
          tObj.liked_by_user = {};
        }
        tObj.liked_by_user[uid] = true;
      }
    }
    return tObj;
  });
}

let toggleRetweet = (tweetRef, uid)=> {
  tweetRef.transaction((tObj) => {
    console.log(tObj);
    if (tObj) {
      if (tObj.retweets && tObj.retweeted_by_user[uid]) {
        tObj.retweets--;
        tObj.retweeted_by_user[uid] = null;
      } else {
        tObj.retweets++;
        if (!tObj.retweeted_by_user) {
          tObj.retweeted_by_user = {};
        }
        tObj.retweeted_by_user[uid] = true;
      }
    }
    return tObj;
  });
}

let sendTweet = ()=>{
  const user = firebase.auth().currentUser;
    var myRef = firebase.database().ref().child("/tweets").push();
    var tweetID = myRef.key; 
    const myObj = {
                   "content": $("#tweet").val(), 
                   "likes": 0, 
                   "retweets": 0, 
                   "timestamp": new Date().getTime(), 
                   "authorID": user.uid 
                  };
    updateUser(user, tweetID);
    myRef.set(myObj);
}

let searchUser = ()=>{
  $("#mainpage").hide();
  $("#user-search").show();
  let youruser = $("#search-box").val();
  if (!!youruser){
    const myParams = new URLSearchParams(window.location.search);
    myParams.set('user', youruser);
    window.location.search = myParams;
  }
}

let updateUser = (user, tweetID)=>{;
  var userRef = firebase.database().ref().child("/users").child(user.uid);
  userRef.get().then((ss) => {
    let userData = ss.val();
    if(!userData){
      const newUser = {
        handle: user.displayName,
        pic: user.photoURL,
        tweets:{
          [tweetID] : true,
        } 
        };
      userRef.set(newUser);
    } 
    else{
      const newUserTweet = {
          [tweetID] : true,
      } 
      userRef.child("/tweets").update(newUserTweet);
    }
  }); 
}

rtdb.onChildChanged(tweetRef, (ss)=>{
  let tObj = ss.val(); 
  let ID = ss.key;
  let newText = "Likes: " + tObj.likes + " Retweets: " + tObj.retweets;
  $("#likeRTtext-"+[ID]).text(newText);
});

rtdb.onChildRemoved(tweetRef, (ss)=>{
  let tweetID = ss.key;
  $("div[data-uuid=" + tweetID + "]").remove();
});

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("user")){
  console.log("User in URL: " + urlParams.get("user"));
  var user = urlParams.get("user");
  renderSearch(user);
} else {
  console.log("no user in url");
}
