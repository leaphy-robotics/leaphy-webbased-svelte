import binascii

with open("%FILENAME%", "w") as f:
    f.write(binascii.a2b_base64("%CONTENT%"))
