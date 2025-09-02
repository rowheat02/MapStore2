#!/usr/bin/env python3
"""
Simple HTTP File Server

A Python script to serve files from a given folder using HTTP server.
Supports basic file serving, directory listing, and configuration options.
"""

import os
import sys
import argparse
import mimetypes
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path


class FileServerHandler(SimpleHTTPRequestHandler):
    """Custom HTTP request handler for serving files."""
    
    def __init__(self, *args, directory=None, **kwargs):
        self.directory = directory
        super().__init__(*args, directory=directory, **kwargs)
    
    def do_GET(self):
        """Handle GET requests."""
        try:
            # Parse the URL path
            path = urllib.parse.unquote(self.path)
            
            # Security check: prevent directory traversal
            if '..' in path:
                self.send_error(403, "Forbidden")
                return
            
            # Convert to absolute path
            file_path = os.path.join(self.directory, path.lstrip('/'))
            
            # Check if file exists
            if not os.path.exists(file_path):
                self.send_error(404, "File not found")
                return
            
            # Check if it's a directory
            if os.path.isdir(file_path):
                self.send_directory_listing(file_path, path)
                return
            
            # Serve the file
            self.send_file(file_path)
            
        except Exception as e:
            self.send_error(500, f"Internal server error: {str(e)}")
    
    def end_headers(self):
        """Add CORS headers to all responses."""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()
    
    def do_OPTIONS(self):
        """Handle OPTIONS requests for CORS preflight."""
        self.send_response(200)
        self.end_headers()
    
    def send_file(self, file_path):
        """Send a file to the client."""
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
            
            # Determine content type
            content_type, _ = mimetypes.guess_type(file_path)
            if content_type is None:
                content_type = 'application/octet-stream'
            
            # Send headers
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            
            # Send content
            self.wfile.write(content)
            
        except Exception as e:
            self.send_error(500, f"Error reading file: {str(e)}")
    
    def send_directory_listing(self, dir_path, url_path):
        """Send directory listing."""
        try:
            # Get directory contents
            items = []
            for item in os.listdir(dir_path):
                item_path = os.path.join(dir_path, item)
                is_dir = os.path.isdir(item_path)
                size = os.path.getsize(item_path) if not is_dir else 0
                items.append({
                    'name': item,
                    'is_dir': is_dir,
                    'size': size
                })
            
            # Sort: directories first, then files
            items.sort(key=lambda x: (not x['is_dir'], x['name'].lower()))
            
            # Generate HTML
            html = self.generate_directory_html(items, url_path)
            
            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(html.encode('utf-8'))))
            self.end_headers()
            self.wfile.write(html.encode('utf-8'))
            
        except Exception as e:
            self.send_error(500, f"Error reading directory: {str(e)}")
    
    def generate_directory_html(self, items, url_path):
        """Generate HTML for directory listing."""
        html = f"""<!DOCTYPE html>
<html>
<head>
    <title>Directory listing for {url_path}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        h1 {{ color: #333; }}
        table {{ border-collapse: collapse; width: 100%; }}
        th, td {{ padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }}
        th {{ background-color: #f2f2f2; }}
        a {{ text-decoration: none; color: #0066cc; }}
        a:hover {{ text-decoration: underline; }}
        .dir {{ color: #0066cc; }}
        .file {{ color: #333; }}
        .size {{ text-align: right; }}
    </style>
</head>
<body>
    <h1>Directory listing for {url_path}</h1>
    <table>
        <tr>
            <th>Name</th>
            <th class="size">Size</th>
        </tr>"""
        
        # Add parent directory link if not at root
        if url_path != '/':
            parent_path = '/'.join(url_path.split('/')[:-1]) or '/'
            html += f"""
        <tr>
            <td><a href="{parent_path}">..</a></td>
            <td class="size">-</td>
        </tr>"""
        
        # Add items
        for item in items:
            item_url = f"{url_path.rstrip('/')}/{item['name']}"
            if item['is_dir']:
                item_url += '/'
            
            size_str = f"{item['size']:,}" if not item['is_dir'] else '-'
            css_class = 'dir' if item['is_dir'] else 'file'
            
            html += f"""
        <tr>
            <td><a href="{item_url}" class="{css_class}">{item['name']}</a></td>
            <td class="size">{size_str}</td>
        </tr>"""
        
        html += """
    </table>
</body>
</html>"""
        
        return html
    
    def log_message(self, format, *args):
        """Override to provide better logging."""
        print(f"[{self.log_date_time_string()}] {format % args}")


def main():
    """Main function to run the file server."""
    parser = argparse.ArgumentParser(
        description='Simple HTTP file server',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python file_server.py                    # Serve current directory on port 8000
  python file_server.py /path/to/files    # Serve specific directory
  python file_server.py -p 9000           # Use port 9000
  python file_server.py -b 0.0.0.0       # Bind to all interfaces
        """
    )
    
    parser.add_argument(
        'directory',
        nargs='?',
        default=os.getcwd(),
        help='Directory to serve (default: current directory)'
    )
    
    parser.add_argument(
        '-p', '--port',
        type=int,
        default=8000,
        help='Port to serve on (default: 8000)'
    )
    
    parser.add_argument(
        '-b', '--bind',
        default='localhost',
        help='Address to bind to (default: localhost)'
    )
    
    args = parser.parse_args()
    
    # Validate directory
    directory = os.path.abspath(args.directory)
    if not os.path.exists(directory):
        print(f"Error: Directory '{directory}' does not exist.")
        sys.exit(1)
    
    if not os.path.isdir(directory):
        print(f"Error: '{directory}' is not a directory.")
        sys.exit(1)
    
    # Create server
    try:
        server = HTTPServer(
            (args.bind, args.port),
            lambda *args, **kwargs: FileServerHandler(*args, directory=directory, **kwargs)
        )
        
        print(f"Starting file server...")
        print(f"Directory: {directory}")
        print(f"URL: http://{args.bind}:{args.port}")
        print(f"Press Ctrl+C to stop the server")
        print("-" * 50)
        
        server.serve_forever()
        
    except KeyboardInterrupt:
        print("\nShutting down server...")
        server.shutdown()
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"Error: Port {args.port} is already in use.")
            print("Try using a different port with -p option.")
        else:
            print(f"Error starting server: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main() 