def convert(lines):
    f_out = open("log_sell.csv", "w")
    # per ogni elemento nella lista (riga del file)
    for line in lines:
        data = line.split(',')
        if len(data) == 7:
            #                -owner-         -------- input  check --------         -------- upload  ipfs --------         ------ server  response ------         ---- metamask transaction ----         ------ database  upload ------         --------- total time- --------
            f_out.writelines(data[0] + "," + str(int(data[2])-int(data[1])) + "," + str(int(data[3])-int(data[2])) + "," + str(int(data[4])-int(data[3])) + "," + str(int(data[5])-int(data[4])) + "," + str(int(data[6])-int(data[5])) + "," + str(int(data[6])-int(data[1])) + "\n")
    f_out.close()