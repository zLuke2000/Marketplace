def convert(lines):
    f_out = open("log_sell.csv", "w")
    # per ogni elemento nella lista (riga del file)
    for line in lines:
        data = line.split(',')
        #                -owner-         -------- input  check --------         -------- upload  ipfs --------         ------ server  response ------         ---- metamask transaction ----         ------ database  upload ------
        f_out.writelines(data[0] + "," + str(int(data[2])-int(data[1])) + "," + str(int(data[3])-int(data[2])) + "," + str(int(data[4])-int(data[3])) + "," + str(int(data[5])-int(data[4])) + "," + str(int(data[6])-int(data[5])) +"\n")
        print(data[0], " - input check:", int(data[2])-int(data[1]), "ms\t\t- upload ipfs:", int(data[3])-int(data[2]), "\t\t- server response:", int(data[4])-int(data[3]), "ms\t\t- metamask transaction", int(data[5])-int(data[4]), "ms\t\t database upload:", int(data[6])-int(data[5]), "ms")
    
    f_out.close()