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
    .then(response => response.json()) // Convertir la réponse en JSON
    .then(data => {
        if (data.error) {
            // Gérer l'erreur en fonction du contenu du dictionnaire
            console.error('Erreur:', data.message);
            alert(data.message); // Afficher l'erreur à l'utilisateur
        } else {
            // Traiter la réponse réussie
            console.log('Succès:', data.message);
            window.location = data.url;
        }
    })
    .catch(error => {
        console.error('Erreur :', error);
    });
});
