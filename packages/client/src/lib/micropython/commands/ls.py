import os
import json

def ls(path):
    if path[-1] == '/':
        path = path[:-1]
    dirContent = []
    for entry in os.listdir(path):
        stat = os.stat(path + "/" + entry)
        if (stat[0] & 0x4000) != 0:
            dirContent.append({'name': entry, 'isDir': True})
        elif (stat[0] & 0x8000) != 0:
            dirContent.append({'name': entry, 'isDir': False})

    return json.dumps(dirContent)

print(ls("%PATH%"))
