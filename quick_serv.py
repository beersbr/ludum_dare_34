#!/usr/bin/python
#################
# quick_serv.py
# Quick server to host our python game
#################

import sys
import BaseHTTPServer
from SimpleHTTPServer import SimpleHTTPRequestHandler

HandlerClass = SimpleHTTPRequestHandler
ServerClass = BaseHTTPServer.HTTPServer
Proto = "HTTP/1.0"

if sys.argv[1:]:
    port = int(sys.argv[1])
else:
    port = 8000
    
server_addr = ('127.0.0.1', port)

HandlerClass.protocol_version = Proto
httpd = ServerClass(server_addr, HandlerClass)

sa = httpd.socket.getsockname()
print "Serving HTTP on ", sa[0], " port ", sa[1], " ..."
httpd.serve_forever()