"""Read-only edge telemetry bridge. It only issues GET requests to an explicitly configured status endpoint."""
import json
import os
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

PORT = int(os.getenv("PORT", "8081"))
INTERVAL = max(10, int(os.getenv("POLL_INTERVAL_SECONDS", "30")))
STATUS_URL = os.getenv("HARDWARE_STATUS_URL", "").strip()
BEARER = os.getenv("HARDWARE_BEARER_TOKEN", "")
_lock = threading.Lock()
_snapshot = {"mode": "read-only", "configured": bool(STATUS_URL), "state": "not_configured", "lastPoll": None, "metrics": None}


def poll_forever():
    while True:
        result = {"mode": "read-only", "configured": bool(STATUS_URL), "lastPoll": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "metrics": None}
        if not STATUS_URL:
            result["state"] = "not_configured"
        else:
            parsed = urlparse(STATUS_URL)
            if parsed.scheme not in ("http", "https") or not parsed.hostname:
                result["state"] = "invalid_configuration"
            else:
                headers = {"Accept": "application/json"}
                if BEARER:
                    headers["Authorization"] = f"Bearer {BEARER}"
                try:
                    req = Request(STATUS_URL, headers=headers, method="GET")
                    with urlopen(req, timeout=5) as response:
                        if response.status != 200:
                            raise RuntimeError("status endpoint returned non-200")
                        raw = response.read(65537)
                        if len(raw) > 65536:
                            raise RuntimeError("status response exceeds size limit")
                        payload = json.loads(raw)
                        if not isinstance(payload, dict):
                            raise RuntimeError("status response must be a JSON object")
                        # Keep only safe, bounded telemetry fields; never expose URL, headers, or secrets.
                        metrics = {str(k)[:64]: v for k, v in list(payload.items())[:50] if isinstance(v, (str, int, float, bool, type(None)))}
                        result.update({"state": "ok", "metrics": metrics})
                except (HTTPError, URLError, TimeoutError, ValueError, RuntimeError, OSError):
                    result["state"] = "unavailable"
        with _lock:
            _snapshot.clear()
            _snapshot.update(result)
        time.sleep(INTERVAL)


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path not in ("/health", "/status"):
            self.send_error(404)
            return
        with _lock:
            data = dict(_snapshot)
        body = json.dumps(data).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        # Avoid logging request data that could accidentally contain sensitive values.
        print("edge-agent request", self.command, self.path.split("?", 1)[0])


threading.Thread(target=poll_forever, daemon=True).start()
ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
