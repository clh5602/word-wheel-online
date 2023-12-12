const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const handleLogin = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;

    if (!username || !pass) {
        helper.handleError('Username or password is empty!');
        return false;
    }

    helper.sendPost(e.target.action, {username, pass});

    return false;
}

const handleSignup = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;

    if (!username || !pass || !pass2) {
        helper.handleError('All fields are required!');
        return false;
    }

    if (pass !== pass2) {
        helper.handleError('Passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, {username, pass, pass2});

    return false;
}

const LoginWindow = (props) => {
    return (
        <form id="loginForm"
            name="loginForm"
            onSubmit={handleLogin}
            action="/login"
            method="POST"
            className="mainForm"
        >
            <h2 id="errorMessage"></h2>
            <label htmlFor='username'>Username: </label>
            <input id='user' type='text' name='username' placeholder='username'/>
            <label htmlFor='pass'>Password: </label>
            <input id='pass' type='password' name='pass' placeholder='password' />
            <input className='formSubmit' type='submit' value='Sign in' />
            <button id="switchToSignup">Don't have an account?</button>
        </form>
    );
};

const SignupWindow = (props) => {
    return (
        <form id="signupForm"
            name="signupForm"
            onSubmit={handleSignup}
            action="/signup"
            method="POST"
            className="mainForm"
        >
            <h2 id="errorMessage"></h2>
            <label htmlFor='username'>Username: </label>
            <input id='user' type='text' name='username' placeholder='username'/>
            <label htmlFor='pass'>Password: </label>
            <input id='pass' type='password' name='pass' placeholder='password' />
            <label htmlFor='pass2'>Password: </label>
            <input id='pass2' type='password' name='pass2' placeholder='retype password' />
            <input className='formSubmit' type='submit' value='Sign up' />
            <button id="switchToLogin">Already have an account?</button>
        </form>
    );
};

const loginAction = (e) => {
    e.preventDefault();
    ReactDOM.render(<LoginWindow />, document.getElementById('content'));
    document.getElementById('switchToSignup').addEventListener('click', signupAction);
    return false;
}

const signupAction = (e) => {
    e.preventDefault();
    ReactDOM.render(<SignupWindow />, document.getElementById('content'));
    document.getElementById('switchToLogin').addEventListener('click', loginAction);
    return false;
}

const init = () => {

    ReactDOM.render(<LoginWindow />, document.getElementById('content'));
    document.getElementById('switchToSignup').addEventListener('click', signupAction);
};

window.onload = init;