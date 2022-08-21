try:
    from numpy import mean, around
except ModuleNotFoundError:
    print("numpy necessario per eseguire questo script, eseguire 'pip install numpy' nel terminale.\n--\nDigitare y per installare o qualsiasi altro tasto per terminare il programma")
    _exit(0)

def convert(lines):
    list_value = []

    # per ogni elemento nella lista (riga del file)
    for line in lines:
        # creo uno struttura dati a dizionario
        data = line.split(',')
        list_value.append({"owner": data[0], "mongoDB-start": int(data[1]), "mongoDB-end": int(data[2]), "ipfs-raw": [int(data[2])], "ipfs": [], "status-sent": int(data[-1])})

        # metto in una lista (ipfs-raw) i vari timestamp delle letture da ipfs
        for ipfs in data[3:-1]:
            list_value[-1]["ipfs-raw"].append(int(ipfs))

        # metto in una lista (ipfs) le differenze di timestamp fra le letture da ipfs
        for i in range(1, len(list_value[-1]["ipfs-raw"])):
            list_value[-1]["ipfs"].append(list_value[-1]["ipfs-raw"][i]-list_value[-1]["ipfs-raw"][i-1])

    # creo un file (log.csv) e metto i dati elaborati dei soli account con almeno un elemento su ipfs
    f_out = open("log_read.csv", "w")
    for line in list_value:
        if len(line["ipfs"]) != 0: 
            #                --- owner ---         ------------------ mongo DB ------------------         -- numero  elementi --         ----------- media ipfs -----------         ---------------- http response ----------------         ----------- tempo totale  esecuzione -----------
            f_out.writelines(line["owner"] + "," + str(line["mongoDB-end"]-line["mongoDB-start"]) + "," + str(len(line["ipfs"])) + "," + str(around(mean(line["ipfs"]), 2)) + "," + str(line["status-sent"] - line["ipfs-raw"][-1]) + "," + str(line["status-sent"] - line["mongoDB-start"]) +"\n")
            print(line["owner"], " - mongoDB:", line["mongoDB-end"]-line["mongoDB-start"], "ms\t\t- numero prodotti:", len(line["ipfs"]), "\t\t- media ipfs:", around(mean(line["ipfs"]), 2), "ms\t\t- risposta http:", line["status-sent"] - line["ipfs-raw"][-1], "ms\t\t TOTALE:", line["status-sent"] - line["mongoDB-start"], "ms")
    f_out.close()