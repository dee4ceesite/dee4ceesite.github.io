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
    renderPage(user);
  } 
});

let renderLogin = ()=>{
  $("#login").show();
  $("#mainpage").hide();
  $("#login").on("click", ()=>{
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
  });
}
let renderPage = (loggedIn)=>{ 

  $("#login").hide();
  $("#mainpage").show();
  $("#showTweets").hide();
  let user = loggedIn.displayName;
  $("#login-user").text("Username is: " + user);
  $("#logout").on("click", ()=>{
	  firebase.auth().signOut();
  });
  rtdb.onChildAdded(tweetRef, (ss)=>{
    let tObj = ss.val();
    renderTweet(tObj, ss.key);
    //$("#likebutton").click(function(){alert("button clicked");});
    $("#likebutton").off("click");
    $("#likebutton").on("click", (evt)=>{
      //alert($(evt.currentTarget).attr("data-uuid"));
      let ID = $(evt.currentTarget).attr("data-uuid");
      let tweetIDRef = firebase.database().ref("/tweets").child(ID);
      toggleLike(tweetIDRef, loggedIn.uid);
    });
    
    $("#retweetbutton").off("click");
    $("#retweetbutton").on("click", (evt)=>{
      //alert($(evt.currentTarget).attr("data-uuid"));
      let ID = $(evt.currentTarget).attr("data-uuid");
      let tweetIDRef = firebase.database().ref("/tweets").child(ID);
      toggleRetweet(tweetIDRef, loggedIn.uid);
    });

    $("#deletebutton").off("click");
    $("#deletebutton").on("click", (evt)=>{
      //const user = firebase.auth().currentUser;
      let tweetID = $(evt.currentTarget).attr("data-uuid");
      $("div[data-uuid=" + tweetID+ "]").remove();
      let tweetIDRef = rtdb.ref(db, "/tweets/"+tweetID);
      //alert(tweetIDRef);
      rtdb.remove(tweetIDRef); 

    });
}); 

rtdb.onChildChanged(tweetRef, (ss)=>{
  let tObj = ss.val(); 
  let ID = ss.key;
  let newText = "Likes: " + tObj.likes + " Retweets: " + tObj.retweets;
  $("#likeRTtext-"+[ID]).text(newText);
});

}

let renderTweet = (tObj, uuid)=>{
  $("#alltweets").prepend(`
<div class="card border-dark mb-3 tweet" data-uuid="${uuid}" user-uid="${tObj.author.id}" style="max-width: 540px;">
  <div class="row g-0">
    <div class="col-md-4">
      <img src="${tObj.author.pic}" class="img-fluid rounded-start" referrerpolicy="no-referrer" alt="..."></img>
    </div>
    <div class="col-md-8">
      <div class="card-body">
        <h5 class="card-title">${tObj.author.handle}</h5>
          <p class="card-text">${tObj.content}</p>
          <p class="card-text"><small class="text-muted">Tweeted at ${new Date(tObj.timestamp).toLocaleString()}</small></p>
          <p class="card-text" id="likeRTtext-${uuid}">Likes: ${tObj.likes} Retweets: ${tObj.retweets}</p>
        <div id="buttons">
          <button id="likebutton" href="#" class="btn btn-danger likebutton" data-uuid="${uuid}">Like</button>
          <button id="retweetbutton" href="#" class="btn btn-success retweetbutton" data-uuid="${uuid}">Retweet</button>
          <button id="deletebutton" href="#" class="btn btn-dark deletebutton" data-uuid="${uuid}">Delete Tweet</button>
        </div>
      </div>
    </div>
  </div>
</div>
  `);
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
  let username = user.displayName;
  let image = user.photoURL;
  let tweet = $("#tweet").val();
  let likes = 0;
  let retweets = 0; 
  const myObj = {"content": tweet, 
                 "likes": likes, 
                 "retweets": retweets, 
                 "timestamp": new Date().getTime(), 
                 "author": {
                  "handle": username, 
                  "pic": image,
                  "id": user.uid }};
  rtdb.push(tweetRef, myObj);
})

$("#nukeTweets").on("click", ()=>{
  rtdb.remove(tweetRef);
  $("#alltweets").empty();
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
