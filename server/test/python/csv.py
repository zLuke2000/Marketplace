from os import path, _exit, listdir
import sell
import buy
import read
import cpumemory

files = listdir()
for file in files:
    if file == 'raw_read.csv':
        f_in = open(file, 'r')
        csv_lines = f_in.read().split("\n")
        read.convert(csv_lines)
        f_in.close()
    if file == 'raw_sell.csv':
        f_in = open(file, 'r')
        csv_lines = f_in.read().split("\n")
        sell.convert(csv_lines)
        f_in.close()
    if file == 'raw_buy.csv':
        f_in = open(file, 'r')
        csv_lines = f_in.read().split("\n")
        buy.convert(csv_lines)
        f_in.close()
    if file.endswith('.log'):
        f_in = open(file, 'r')
        lines = f_in.read().split("\n")
        cpumemory.convert(lines, file)
        f_in.close()