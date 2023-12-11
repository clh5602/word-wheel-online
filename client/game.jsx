const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const socket = io();


const JoiningPage = (props) => {
    if (!props.playerCount) {
        return (
            <div class="joining">
                <h1>Joining Game...</h1>
            </div>
        );
    }

    return (
        <div class="joining">
            <h1>Joining Game...</h1>
            <h2>Party: {props.playerCount}/3</h2>
        </div>
    );
};

const init = () => {

    ReactDOM.render(
        <JoiningPage />,
        document.getElementById('content')
    );

}

window.onload = init;