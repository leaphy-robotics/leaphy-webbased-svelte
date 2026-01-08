import sys
#f-strings were introduced in python 3.7
print("{\"python_version\":\"","{}.{}.{}".format(sys.version_info[0],sys.version_info[1],sys.version_info[2]),"\",\"micropython_version\":\"","{}.{}.{}".format(sys.implementation.version[0],sys.implementation.version[1],sys.implementation.version[2]),"\"}",sep="")
