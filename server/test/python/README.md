# Lo script python csv.py consente di organizzare i dati ricavati dal server rendendoli leggibili da applicazioni di terze parti per ricavare grafici

## Per eseguire lo script è necessario aver installato **[numpy](https://numpy.org/)**

Il file di input deve essere nella stessa direcory del file python e deve rispettare le seguenti caratteristiche:
- deve avere nome: **raw.csv**
- ogni riga deve essere composta da:
    - owner (_es: 0x00f2923Ede246d46164Ee8476351F6098bF19bEA_)
    - timestamp di inizio lettura dati mongoDB
    - timestamp di fine lettura dati mongoDB
    - timestamp di fine lettura dato ipfs (_per ogni prodotto associato all'owner_)
    - timestamp di fine operazione (_successivamente all'invio della risposta HTTP_)
    - _i dati nella riga devono essere separati da virgole ','_

Il file di output avrà le seguenti caratteristiche:
- nome: **log.csv**
- ogni riga sarà composta da:
    - owner
    - tempo di lettura dati su mongoDB
    - numero di dati letti da mongoDB
    - media dei tempi di lettura dati da ipfs (_troncata a due decimali_)
    - tempo di invio risposta HTTP (_fine operazione_)
    - tempo totale esecuzione richiesta (_da considerare in relazione al numero di elementi su ipfs_)