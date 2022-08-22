def convert(lines):
    f_out = open("log_buy.csv", "w")
    # per ogni elemento nella lista (riga del file)
    for line in lines:
        data = line.split(',')
        if len(data) == 5:
            #                -owner-         ------- database  read -------         ---- metamask transaction ----         ------ database update  ------         --------- total time ---------
            f_out.writelines(data[0] + "," + str(int(data[2])-int(data[1])) + "," + str(int(data[3])-int(data[2])) + "," + str(int(data[4])-int(data[3])) + "," + str(int(data[4])-int(data[1])) + "\n")
    f_out.close()