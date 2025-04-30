import sys

with open("%PATH%", "r") as f:
    while True:
        result = f.read(32)
        if result == "":
            break
        
        sys.stdout.write(result)
