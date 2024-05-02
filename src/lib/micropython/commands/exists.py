import os

try:
    os.stat("%PATH%")[0]
    print(True)
except OSError:
    print(False)
