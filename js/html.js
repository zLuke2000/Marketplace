function generaCard(divID) {
    let div = document.getElementById(divID);
    
    let cardTemplate = '<div class="card mb-3"> ' +
    '<div class="row no-gutters"> ' +
    '<div class="col-md-11"> ' +
    '<div class="card-body"> ' +
    '<h5 class="card-title">Nome del prodotto</h5> ' +
    '<p class="card-text">Descrizione del prodotto.</p> ' +
    '<p class="card-text"><small class="text-muted">owner: </small></p> ' +
    '</div> ' +
    '</div> ' +
    '<div class="col-md-1"> <img src="#" class="card-img" alt="..."> </div> ' +
    '</div> ' +
    '</div> '

    div.innerHTML += cardTemplate
}