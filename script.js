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


let tweetJSON = {
  "content": "Way to bounce back, Big Mike Williams.",
  "likes": -1,
  "retweets": 50,
  "timestamp": 1663335385014,
  "author": {
    "handle": "ProfNinja",
    "pic": "https://ih1.redbubble.net/image.1036063426.6926/st,small,507x507-pad,600x600,f8f8f8.jpg"
  }
};

firebase.initializeApp(firebaseConfig);
firebase.auth().onAuthStateChanged(user => {
  //alert("hey whats up man how yah doin");
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
    //alert(userData);
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
  $("#search-butt-main").on("click", ()=>{
    $("#mainpage").hide();
    $("#user-search").show();
    let youruser = $("#search-box").val();
    if (!!youruser){
      const myParams = new URLSearchParams(window.location.search);
      myParams.set('user', youruser);
      window.location.search = myParams;
      renderSearch(youruser);
    }
  }); 
  rtdb.onChildAdded(tweetRef, (ss)=>{
    let tObj = ss.val();
    renderTweet(tObj, ss.key, "alltweets");
}); 
}

rtdb.onChildChanged(tweetRef, (ss)=>{
  let tObj = ss.val(); 
  let ID = ss.key;
  let newText = "Likes: " + tObj.likes + " Retweets: " + tObj.retweets;
  $("#likeRTtext-"+[ID]).text(newText);
});

let renderEdit = (user) =>{
  $("#mainpage").hide();
  $("#editUser").show();
  
  $("#editUser").html(`
    <p>Here is your info:</p>
    <div id="userImg"></div>
    <div id="username"></div>
    <input id="newHandle" placeholder="New Handle"/><button id="handle-butt">Update Handle</button>
    <input id="newImg" placeholder="New Image Link"/><button id="img-butt">Upload Image</button>
    <button id="leave-edit">Go Back</button>
  `);
  var userRef = firebase.database().ref().child("/users").child(user.uid);
  userRef.get().then((ss) => {
    let userData = ss.val();
    //alert(userData);
    if(!userData){
      alert("there is none");
    } 
    else{
      $("#userImg").html(`<img id="userPFP" src="${userData.pic}"></img>`);
      $("#username").html(`<p>Username: ${userData.handle} <p>`);
    }
  });

  $("#handle-butt").on("click", ()=>{
    alert($("#newHandle").val());
    userRef.child("handle").set($("#newHandle").val());
    renderEdit(user);
  });
  $("#img-butt").on("click", ()=>{
    alert($("#newImg").val());
    userRef.child("pic").set($("#newImg").val());
    renderEdit(user);
    
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
  //alert(userKey);
  const dbRef = firebase.database().ref();
  
  dbRef.child("users").child(userKey).get().then((ss) => {
    let userData = ss.val();
    let hey = "im a variable";
    console.log(userData);
    $("#searched-info").html(`
      <p>We found the user: ${userData.handle}</p>
      <p>Here's their tweets:</p>
      <div id="userTweets"></div>
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

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("user")){
  //renderGreeting(urlParams.get("user"));
  console.log("User in URL: " + urlParams.get("user"));
  var user = urlParams.get("user");
  renderSearch(user);
} else {
  //renderLogin();
  console.log("no user in url");
}

let renderTweet = (tObj, uuid, location)=>{
  let userID = tObj.authorID;
  var handle = "Default User";
  var image = "https://thumbs.dreamstime.com/b/default-avatar-profile-trendy-style-social-media-user-icon-187599373.jpg";
  var userRef = firebase.database().ref().child("/users").child(userID);
  console.log("Rendering Tweet"); 
  userRef.get().then((ss) => {
    //console.log("Updating Info");
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
  <div class="card border-dark mb-3 tweet" data-uuid="${uuid}" data-user-uid="${userID}" style="max-width: 600px;">
    <div class="row g-0">
      <div id="userImg-${uuid}" class="col-md-4">
        <img src="${image}" class="twtImg img-fluid rounded-start" referrerpolicy="no-referrer" alt="..."></img>
      </div>
      <div class="col-md-8">
        <div class="card-body">
          <h5 class="card-title" id="userHandle-${uuid}">${handle}</h5>
            <p class="card-text">${tObj.content}</p>
            <p class="card-text"><small class="text-muted">Tweeted at ${new Date(tObj.timestamp).toLocaleString()}</small></p>
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
    //alert($(evt.currentTarget).attr("data-uuid"));
    let ID = $(evt.currentTarget).attr("data-uuid");
    let tweetIDRef = firebase.database().ref("/tweets").child(ID);
    toggleLike(tweetIDRef, loggedIn.uid);
  });
  
  $(".retweetbutton").off("click");
  $(".retweetbutton").on("click", (evt)=>{
    //alert($(evt.currentTarget).attr("data-uuid"));
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
    //const user = firebase.auth().currentUser;
    let tweetID = $(evt.currentTarget).attr("data-uuid");
    let authorID = $(evt.currentTarget).attr("data-user-uid");
    console.log(evt.currentTarget);
    $("div[data-uuid=" + tweetID+ "]").remove();
    let tweetIDRef = rtdb.ref(db, "/tweets/"+tweetID);
    //alert(tweetIDRef);
    rtdb.remove(tweetIDRef); 
    let authorIDRef = rtdb.ref(db, "/users/"+authorID+"/tweets/"+tweetID);
    //alert(authorIDRef);
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

$("#tweetbutt").on("click", evt=>{
  const user = firebase.auth().currentUser;
  let tweet = $("#tweet").val();
  let likes = 0;
  let retweets = 0;
  var myRef = firebase.database().ref().child("/tweets").push();
  var tweetID = myRef.key; 
  const myObj = {
                 "content": tweet, 
                 "likes": likes, 
                 "retweets": retweets, 
                 "timestamp": new Date().getTime(), 
                 "authorID": user.uid 
                };
  //console.log(tweetID);
  updateUser(user, tweetID);
  myRef.set(myObj);
  //rtdb.push(tweetRef, myObj);
});

let updateUser = (user, tweetID)=>{;
  var userRef = firebase.database().ref().child("/users").child(user.uid);
  userRef.get().then((ss) => {
    let userData = ss.val();
    //alert(userData);
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
      //console.log(userData);
      const newUserTweet = {
          [tweetID] : true,
      } 
      userRef.child("/tweets").update(newUserTweet);
    }
    //console.log(userData);
  });
  
  
}

$("#nukeTweets").on("click", ()=>{
  rtdb.remove(tweetRef);
  $("#alltweets").empty();
});

$("#user-search").hide();

$("#editUser").hide();

$("#ret-butt").on("click", ()=>{
  $("#mainpage").show();
  $("#user-search").hide();
});

$("#hideTweets").on('click', ()=>{
  $("#alltweets").hide();
  $("#hideTweets").hide();
  $("#showTweets").show();
});
$("#showTweets").on('click', ()=>{
  $("#alltweets").show();
  $("#showTweets").hide();
  $("#hideTweets").show();
});

function toDataURL(src, callback, outputFormat) {
  
  var img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = function() {
    var canvas = document.createElement('CANVAS');
    var ctx = canvas.getContext('2d');
    var dataURL;
    canvas.height = this.naturalHeight;
    canvas.width = this.naturalWidth;
    ctx.drawImage(this, 0, 0);
    dataURL = canvas.toDataURL(outputFormat);
    callback(dataURL);
  };
  img.src = src + "?busting-this-cache";
  alert(img.src);
  if (img.complete || img.complete === undefined) {
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
    img.src = src;
  }
}
