from os import path, _exit, listdir
import sell
import buy
import read
import cpumemory
try:
    from numpy import mean, around
except ModuleNotFoundError:
    print("numpy necessario per eseguire questo script, eseguire 'pip install numpy' nel terminale.\n--\nDigitare y per installare o qualsiasi altro tasto per terminare il programma")
    _exit(0)

files = listdir()
for file in files:
    if file == 'raw_read.csv':
        f_in = open((path.dirname(__file__) + "\\" + file), 'r')
        csv_lines = f_in.read().split("\n")
        read.convert(csv_lines)
        f_in.close()
    if file == 'raw_sell.csv':
        f_in = open((path.dirname(__file__) + "\\" + file), 'r')
        csv_lines = f_in.read().split("\n")
        sell.convert(csv_lines)
        f_in.close()
    if file == 'raw_buy.csv':
        f_in = open((path.dirname(__file__) + "\\" + file), 'r')
        csv_lines = f_in.read().split("\n")
        buy.convert(csv_lines)
        f_in.close()
    if file.endswith('.log'):
        f_in = open((path.dirname(__file__) + "\\" + file), 'r')
        lines = f_in.read().split("\n")
        cpumemory.convert(lines, file)
        f_in.close()