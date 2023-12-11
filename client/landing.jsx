const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

let curAccount;

const displayAccountType = (type) => {
    if (type) {
        return "Premium Account";
    } else {
        return "Basic Account";
    }
}

const displayAccountVisibility = (type) => {
    if (type) {
        return "This Account is Visible on the Leaderboard";
    } else {
        return "This Account is Not Visible on the Leaderboard";
    }
}

const visibilityButton = (e) => {
    e.target.textContent = "Changing..."
    helper.sendPost("/visible", {}, (data) => {
        curAccount = data;
        ReactDOM.render(
            <Settings />, document.getElementById('content')
        );
    });
}

const handlePassword = (e) => {
    e.preventDefault();
    helper.hideError();

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

    helper.sendPost(e.target.action, {oldPass, newPass});

    return false;
}

const PasswordWindow = (props) => {
    return (
        <form id="passwordForm"
            name="passwordForm"
            onSubmit={handlePassword}
            action="/changePass"
            method="POST"
            className="passForm"
        >
            <label htmlFor='oldPass'>Old Password: </label>
            <input id='oldPass' type='password' name='oldPass' placeholder='old password' />
            <label htmlFor='newPass'>New Password: </label>
            <input id='newPass' type='password' name='newPass' placeholder='new password' />
            <label htmlFor='newPass2'>Confirm New Password: </label>
            <input id='newPass2' type='password' name='newPass2' placeholder='retype new password' />
            <input className='formSubmit' type='submit' value='Change Password' />
        </form>
    );
};

const changePasswordButton = (e) => {
    ReactDOM.render(
        <PasswordWindow />, document.getElementById('content')
    );
}

const calculateWinRate = (played, won) => {
    if (played <= 0) {
        return 0;
    } else {
        return Math.round(100 * (won / played));
    }
}

// shows when reaching the landing page
const LandingOverview = (props) => {
    return (
        <div class="account-overview">
            <h1>Word Wheel Online - Home</h1>
            <img src="/assets/img/default-pfp.png" id="pfp"></img>
            <h2>{curAccount.username}</h2>
            <h3>{displayAccountType(curAccount.isPremium)}</h3>
            <h2>Score: {curAccount.winnings}</h2>
            <a href='/game'><button>Start Game!</button></a>
        </div>
    );
};

// shows when going to account settings
const Settings = (props) => {
    return (
        <div class="settings">
            <h1>Word Wheel Online - Account Settings</h1>
            <img src="/assets/img/default-pfp.png" id="pfp"></img>
            <h2>{curAccount.username}</h2>
            <h3>{displayAccountType(curAccount.isPremium)}</h3>
            <h3>{displayAccountVisibility(curAccount.isVisible)}</h3>
            <h2>Score: {curAccount.winnings}</h2>
            <h2>Games Played: {curAccount.gamesPlayed}</h2>
            <h2>Win Rate: {calculateWinRate(curAccount.gamesPlayed, curAccount.gamesWon)}%</h2>

            <button type="button" onClick={visibilityButton}>Toggle Account Visibility</button>
            <button type="button">Purchase Premium</button>
            <button type="button" onClick={changePasswordButton}>Change Password</button>
            <a href="/logout"><button type="button">Logout</button></a>
        </div >
    );
}; 

// shows when viewing the leaderboard
const Leaderboard = (props) => {
    return (
        <div class="settings">
            <h1>Word Wheel Online - Leaderboard</h1>
            <ol>
                <li>Placeholder 1</li>
                <li>Placeholder 2</li>
                <li>Placeholder 3</li>
                <li>Placeholder 4</li>
                <li>Placeholder 5</li>
                <li>Placeholder 6</li>
                <li>Placeholder 7</li>
                <li>Placeholder 8</li>
                <li>Placeholder 9</li>
                <li>Placeholder 10</li>
            </ol>
        </div>
    );
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
            <Leaderboard />, document.getElementById('content')
        );
    }

    ReactDOM.render(
        <LandingOverview />, document.getElementById('content')
    );
};

window.onload = init;