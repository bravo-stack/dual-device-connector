require('dotenv').config();

const fs = require('fs');
const path = require('path');
const http = require('http');

const dirToShare = process.env.PATH_TO_SHARE;

const sharedDirectory = path.join(__dirname, dirToShare);

const PORT = process.env.PORT;

const server = http.createServer((req, res) => {
	const parsedUrl = url.parse(req.url);
	let pathname = decodeURIComponent(parsedUrl.pathname);
	let filePath = path.join(dirToShare, pathname);

	// if directory is requested → list files
	if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
		const files = fs.readdirSync(filePath);
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.write('<h2>Index of ' + pathname + '</h2><ul>');
		files.forEach((f) => {
			res.write(`<li><a href="${path.join(pathname, f)}">${f}</a></li>`);
		});
		res.end('</ul>');
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
