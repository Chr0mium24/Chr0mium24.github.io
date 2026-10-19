# 本地预览用：和 python -m http.server 一样，只多两件事——
#   1. 不让浏览器缓存（改完 JS 刷新就生效）
#   2. 找不到的地址返回 site/404.html（和 GitHub Pages 一样，旧地址跳转能在本地测）
# 用法：python3 scripts/serve.py 8774 site
import functools, http.server, os, sys

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def send_error(self, code, message=None, explain=None):
        page = os.path.join(self.directory, '404.html')
        if code == 404 and os.path.exists(page):
            body = open(page, 'rb').read()
            self.send_response(404)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().send_error(code, message, explain)

port, root = int(sys.argv[1]), sys.argv[2]
http.server.ThreadingHTTPServer(('', port), functools.partial(Handler, directory=root)).serve_forever()
