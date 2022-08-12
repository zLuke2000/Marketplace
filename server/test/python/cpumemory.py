def convert(lines, file_name):
    f_out = open("log_" + file_name.replace(".log", ".csv"), "w")

    blocks = []
    keys = []

    # organizzio in una struttura i dati letti
    for line in lines:
        line = line.strip().split(' ')
        if len(line) > 3:
            if(line[0] == "%CPU"):
                blocks.append({'timestamp': line[7]})
            else:
                blocks[-1][line[3] + '__cpu'] =  line[0]
                blocks[-1][line[3] + '__mem'] =  line[2]

                if line[3] + '__cpu' not in keys:
                    keys.append(line[3] + '__cpu')
                if line[3] + '__mem' not in keys:
                    keys.append(line[3] + '__mem')

    # imposto a null i dati non esistenti per processo
    for block in blocks:
        for key in keys:
            if key not in block:
                block[key] = '-.-'
    
    # scrivo su file i timestamp (prima riga)
    f_out.writelines('processo/timestamp')
    for b in blocks:
        f_out.writelines(',' + b["timestamp"])
    f_out.writelines('\n')

    # scrivo su file i processi, riga per riga, con intestazione nome_cpu o nome_mem
    for k in keys:
        f_out.writelines(k)
        for b in blocks:
            f_out.writelines(',' + b[k])
        f_out.writelines('\n')
    f_out.close()