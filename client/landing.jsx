const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

let curAccount;
let topTen = [];

// gets a string based on premium status
const displayAccountType = (type) => {
    if (type) {
        return "Premium Account";
    } else {
        return "Basic Account";
    }
}

// gets a string based on visibility status
const displayAccountVisibility = (type) => {
    if (type) {
        return "This Account is Visible on the Leaderboard";
    } else {
        return "This Account is Not Visible on the Leaderboard";
    }
}

// toggles the visibility of this user
const visibilityButton = (e) => {
    e.target.textContent = "Changing..."
    helper.sendPost("/visible", {}, (data) => {
        loadLeaderboard();
        curAccount = data;
        e.target.textContent = "Toggle Account Visibility";
        ReactDOM.render(
            <Settings />, document.getElementById('content')
        );
    });
}

// passma
const handlePassword = (e) => {
    e.preventDefault();

    const oldPass = e.target.querySelector('#oldPass').value;
    const newPass = e.target.querySelector('#newPass').value;
    const newPass2 = e.target.querySelector('#newPass2').value;

    if (!oldPass || !newPass || !newPass2) {
        helper.handleError('All fields are required!');
        return false;
    }

    if (newPass !== newPass2) {
        helper.handleError('New passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, { oldPass, newPass });

    return false;
}

// html for change password form
const PasswordWindow = (props) => {
    return (
        <form id="passwordForm"
            name="passwordForm"
            onSubmit={handlePassword}
            action="/changePass"
            method="POST"
            className="passForm"
        >
            <h2 id="errorMessage"></h2>
            <label htmlFor='oldPass'>Old Password: </label>
            <input id='oldPass' type='password' name='oldPass' placeholder='old password' />
            <label htmlFor='newPass'>New Password: </label>
            <input id='newPass' type='password' name='newPass' placeholder='new password' />
            <label htmlFor='newPass2'>Confirm New: </label>
            <input id='newPass2' type='password' name='newPass2' placeholder='retype new password' />
            <input className='formSubmit' type='submit' value='Change Password' />
        </form>
    );
};

// butt
const changePasswordButton = (e) => {
    ReactDOM.render(
        <PasswordWindow />, document.getElementById('content')
    );
}

// shows when reaching the landing page
const LandingOverview = (props) => {
    return (
        <div>
            <h1>Word Wheel Online - Home</h1>
            <div class="column-flex">
                <div class="account-overview column">
                    <img src="/assets/img/default-pfp.svg" id="pfp"></img>
                    <h2>{curAccount.username}</h2>
                    <h3>{displayAccountType(curAccount.isPremium)}</h3>
                    <h2>Score: {curAccount.winnings}</h2>
                </div>
                <div class="column row-flex">
                    <p>A blank word puzzle will appear on screen, and letters
                        will slowly begin to fill the empty slots of the puzzle.
                        When you know the phrase, buzz in, and solve the puzzle
                        by typing into your keyboard. You're competing against
                        three other players, so answer quickly!
                    </p>
                    <a href='/game'><button class="menuButton">Start Game!</button></a>
                </div>
            </div>
        </div>
    );
};

// shows when going to account settings
const Settings = (props) => {
    return (
        <div class="settings">
            <h1>Word Wheel Online - Account Settings</h1>
            <div class="column-flex">
                <div class="account-overview column">
                    <img src="/assets/img/default-pfp.svg" id="pfp"></img>
                    <h2>{curAccount.username}</h2>
                    <h3>{displayAccountType(curAccount.isPremium)}</h3>
                    <h3>{displayAccountVisibility(curAccount.isVisible)}</h3>
                    <h2>Score: {curAccount.winnings}</h2>
                </div>

                <div class="column row-flex">
                    <button type="button" class="menuButton" onClick={visibilityButton}>Toggle Account Visibility</button>
                    <button type="button" class="menuButton">Purchase Premium</button>
                    <button type="button" class="menuButton" onClick={changePasswordButton}>Change Password</button>
                    <a href="/logout"><button class="menuButton" type="button">Logout</button></a>
                </div>


            </div>
        </div >
    );
};

// shows when viewing the leaderboard
const Leaderboard = (props) => {

    if (props.topTen.length === 0) {
        <div class="leaderboard">
            <h1>Word Wheel Online - Leaderboard</h1>
            <h3>This content has not loaded yet - check back soon!</h3>
        </div>
    }

    const userLIs = props.topTen.map((user, index) => {
        if (index % 2 == 0) {
            return (
                <li class="light">{user.username}: {user.winnings} points</li>
            );
        } else {
            return (
                <li class="dark">{user.username}: {user.winnings} points</li>
            );
        }

    });

    return (
        <div class="leaderboard">
            <h1>Word Wheel Online - Leaderboard</h1>
            <ol>
                {userLIs}
            </ol>
        </div>
    );
};

// load the leaderboard when the page is initialized
const loadLeaderboard = async () => {
    const response = await fetch('/topTen');
    topTen = await response.json();
};

const init = async () => {
    curAccount = await helper.getAccountInfo();

    document.getElementById("settings").onclick = () => {
        ReactDOM.render(
            <Settings />, document.getElementById('content')
        );
    }

    document.getElementById("leaderboard").onclick = () => {
        ReactDOM.render(
            <Leaderboard topTen={topTen} />, document.getElementById('content')
        );
    }

    ReactDOM.render(
        <LandingOverview />, document.getElementById('content')
    );

    loadLeaderboard();
};

window.onload = init;