const button = document.getElementById('btn_createProduct');
button.addEventListener('click', function (e) {
    e.preventDefault()
    console.log('button was clicked');
    const prod = {
        'name': 'prova',
        'price': '10'
    }
    fetch('/click', {
        method: 'POST',
        body: JSON.stringify(prod),
        headers: { 'Content-Type': 'application/json' }
    })
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