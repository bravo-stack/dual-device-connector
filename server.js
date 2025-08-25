require('dotenv').config();

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');

const dirToShare = process.env.PATH_TO_SHARE;
const PORT = process.env.PORT;

const server = http.createServer((req, res) => {
	const parsedUrl = url.parse(req.url);
	let pathname = decodeURIComponent(parsedUrl.pathname);
	let filePath = path.join(dirToShare, pathname);

	// if directory is requested → list files
	if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
		const files = fs.readdirSync(filePath);

		const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Index of ${pathname}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background: #f4f6f9;
                        color: #333;
                        padding: 20px;
                        width: 100%;
                    }
                    h2 {
                        margin-bottom: 20px;
                    }
                    ul {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        padding-inline: 12px;
                    }
                    li {
                        margin: 8px 0;
                    }
                    a {
                        text-decoration: underline;
                        color: #007bff;
                        font-weight: 500;
                        word-wrap: break-word;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    a:hover {
                        text-decoration: underline;
                        color: #0056b3;
                    }
                    .container {
                        background: white;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                        max-width: 600px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>📁 Index of ${pathname}</h2>
                    <ul>
                        ${files
													.map(
														(f) =>
															`<li><a href="${path.join(
																pathname,
																f
															)}">${f}</a></li>`
													)
													.join('')}
                    </ul>
                </div>
            </body>
            </html>
	    `;

		res.writeHead(200, { 'Content-Type': 'text/html' });

		res.end(html);
		return;
	}

	// if file exists → stream it
	if (fs.existsSync(filePath)) {
		const ext = path.extname(filePath).toLowerCase();
		const mimeTypes = {
			'.html': 'text/html',
			'.js': 'text/javascript',
			'.css': 'text/css',
			'.json': 'application/json',
			'.png': 'image/png',
			'.jpg': 'image/jpeg',
			'.txt': 'text/plain',
			'.pdf': 'application/pdf',
		};
		res.writeHead(200, {
			'Content-Type': mimeTypes[ext] || 'application/octet-stream',
		});
		fs.createReadStream(filePath).pipe(res);
	} else {
		res.writeHead(404, { 'Content-Type': 'text/plain' });
		res.end('File not found');
	}
});

server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
