def convert(lines):
    f_out = open("log_buy.csv", "w")
    # per ogni elemento nella lista (riga del file)
    for line in lines:
        data = line.split(',')
        #                -owner-         ------- database  read -------         ---- metamask transaction ----         ------ database update  ------
        f_out.writelines(data[0] + "," + str(int(data[2])-int(data[1])) + "," + str(int(data[3])-int(data[2])) + "," + str(int(data[4])-int(data[3])) + "\n")
        print(data[0], " - database read:", int(data[2])-int(data[1]), "ms\t\t- metamask transaction:", int(data[3])-int(data[2]), "\t\t- sdatabase update:", int(data[4])-int(data[3]), "ms")
    
    f_out.close()