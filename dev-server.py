#!/usr/bin/env python3
"""Static dev server for arabuilds.

Why this exists: `wrangler pages dev` runs the Cloudflare `workerd` runtime,
which requires macOS 13.5+. This machine is older, so this is a dependency-free
stand-in for previewing the static site.

It mirrors Cloudflare Pages' clean-URL routing (/foo -> foo.html), so links like
/contractor-intake and /work resolve the same as in production.

NOTE: This does NOT run Pages Functions. /api/intake and /admin only work on a
real deploy (e.g. `npm run deploy`, then test the preview URL).

    npm run dev            # serves on http://localhost:8000
    PORT=3000 npm run dev  # custom port
"""
import http.server
import os
import socketserver

PORT = int(os.environ.get("PORT", "8000"))
ROOT = os.path.dirname(os.path.abspath(__file__))
FUNCTION_PREFIXES = ("/api/", "/admin")


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def send_head(self):
        path = self.path.split("?", 1)[0].split("#", 1)[0]

        # Make it obvious that Functions don't run here.
        if path == "/admin" or path == "/pili" or path == "/auguste" or path == "/ngoc" or path.startswith("/api/"):
            self.send_error(
                501,
                "Functions don't run in local dev",
                "%s is a Cloudflare Pages Function. Deploy and test the preview URL "
                "(`npm run deploy`)." % path,
            )
            return None

        # Clean URLs: if /foo has no file but /foo.html does, serve that.
        if path not in ("/", "") and not path.endswith("/"):
            fs_path = self.translate_path(self.path)
            if not os.path.exists(fs_path) and os.path.isfile(self.translate_path(path + ".html")):
                self.path = path + ".html"

        return super().send_head()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")  # always see latest edits
        super().end_headers()

    def log_message(self, fmt, *args):
        print("  " + (fmt % args))


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("arabuilds dev  →  http://localhost:%d" % PORT)
    print("static preview with clean URLs · Functions (/api, /admin) run only when deployed")
    print("Ctrl+C to stop\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")
