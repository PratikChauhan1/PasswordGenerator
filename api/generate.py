import json
import random
import string
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(content_length) or b"{}")
            password_length = int(payload.get("length", 16))

            if not 4 <= password_length <= 64:
                return self.send_json(400, {"error": "Password length must be between 4 and 64."})

            groups = []
            if payload.get("uppercase", True):
                groups.append(string.ascii_uppercase)
            if payload.get("lowercase", True):
                groups.append(string.ascii_lowercase)
            if payload.get("numbers", True):
                groups.append(string.digits)
            if payload.get("symbols", True):
                groups.append("!@#$%^&*()-_=+[]{};:,.?")

            if not groups:
                return self.send_json(400, {"error": "Select at least one character type."})
            if password_length < len(groups):
                return self.send_json(400, {"error": "Length must be at least the number of selected character types."})

            chars = [random.choice(group) for group in groups]
            all_chars = "".join(groups)
            chars.extend(random.choice(all_chars) for _ in range(password_length - len(chars)))
            random.shuffle(chars)
            self.send_json(200, {"password": "".join(chars)})
        except (ValueError, TypeError, json.JSONDecodeError):
            self.send_json(400, {"error": "Please provide valid password settings."})

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def send_json(self, status, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)
