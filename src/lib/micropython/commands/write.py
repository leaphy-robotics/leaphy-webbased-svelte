import binascii

with open("%PATH%", "w") as f:
    f.write(binascii.a2b_base64("%CONTENT%"))
