const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

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
            <input id='oldPass' type='password' name='oldPass' placeholder='old password'/>
            <label htmlFor='newPass'>New Password: </label>
            <input id='newPass' type='password' name='newPass' placeholder='new password' />
            <label htmlFor='newPass2'>Confirm New Password: </label>
            <input id='newPass2' type='password' name='newPass2' placeholder='retype new password' />
            <input className='formSubmit' type='submit' value='Change Password' />
        </form>
    );
};

const init = () => {
    ReactDOM.render(<PasswordWindow />, document.getElementById('content'));
};

window.onload = init;