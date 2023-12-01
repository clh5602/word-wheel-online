const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

let curAccount;

const getAccountInfo = async () => {
    const response = await fetch('/getAccount');
    const data = await response.json();
    return data.account;
}

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

// shows when reaching the landing page
const LandingOverview = (props) => {
    return (
        <div class="account-overview">
            <h1>Word Wheel Online - Home</h1>
            <img src="/assets/img/default-pfp.png" id="pfp"></img>
            <h2>{curAccount.username}</h2>
            <h3>{displayAccountType(curAccount.isPremium)}</h3>
            <h2>${curAccount.winnings}</h2>
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
            <h2>${curAccount.winnings}</h2>

            <button type="button" onClick={visibilityButton}>Toggle Account Visibility</button>
        </div>
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
    curAccount = await getAccountInfo();

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