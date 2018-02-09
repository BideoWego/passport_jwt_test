async function login() {
  const response = await fetch('http://localhost:3000/login', {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify({
      username: 'foobar',
      password: 'password'
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });
  return await response.json();
}


async function secret(jwt) {
  const response = await fetch('http://localhost:3000/secret', {
    mode: 'cors',
    headers: {
      Authorization: `Bearer ${ jwt.token }`
    }
  });
  return await response.json();
}


function output(json) {
  document.getElementById('output').innerHTML += JSON.stringify(json, null, 2);
}


window.onload = document.onload = async () => {
  const jwt = await login();
  const result = await secret(jwt);
  output({ jwt, result });
};








