def convert(lines, file_name):
    f_out = open("log_" + file_name.replace(".log", ".csv"), "w")
    
    key = []
    timestamps = ["processo"]
    data = {}
    # per ogni elemento nella lista (riga del file)
    for line in lines:
        line = line.strip().split(" ")
        # controllo che la linea abbia il numero minimo di campi per essere elabrotata
        if len(line) < 4:
            # salto al for successivo senza finire il seguente
            continue
        
        # lettura timestamp
        if line[0] == "%CPU" :
            timestamps.append(line[7])
        else:
            process = line[3]
            # lettura campo X per la colonna CPU (se non esiste lo inserisce in una riga nuova)
            if (process + "_cpu") in key:
                data[process + "_cpu"].append(line[0])
            else:
                key.append(process + "_cpu")
                data[process + "_cpu"] = [line[0]]
            # lettura campo X per la colonna MEM (se non esiste lo inserisce in una riga nuova)
            if (process + "_mem") in key:
                data[process + "_mem"].append(line[2])
            else:
                key.append(process + "_mem")
                data[process + "_mem"] = [line[2]]

    # scrivo su file i timestamp + intestazione colonna processo
    f_out.writelines(','.join(timestamps) + "\n")
    # scrivo su file l'utilizzo di CPU e MEM per ogni processo
    for x in key:
        f_out.writelines(x + ',' + ','.join(data[x]) + ",\n")
    f_out.close()