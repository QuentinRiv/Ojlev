console.log("******************");

const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

console.log(container)

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
})

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
    console.log(container)
})


document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('emailIn').value;
    const password = document.getElementById('passwordIn').value;

    // API pour checker le user
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, password: password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Échec de la connexion');
        }
        return response.json();
    })
    .catch(error => {
        console.error('Erreur :', error);
    });
});
