//TODO funzioni per gestione input da interfaccia web e comunicazione con backend

const button = document.getElementById('myButton');
button.addEventListener('click', function (e) {
    e.preventDefault()
    console.log('button was clicked');
    fetch('/click', { method: 'POST', body: JSON.stringify("BELLA PER CP") })
        .then(function (response) {
            if (response.ok) {
                console.log('Click was recorded');
                return;
            }
            throw new Error('Request failed.');
        })
        .catch(function (error) {
            console.log(error);
        });
});