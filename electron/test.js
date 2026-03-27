const e = require('electron');
console.log('type:', typeof e, '| value:', typeof e === 'string' ? e : Object.keys(e).join(','));
if (e.app) { e.app.on('ready', () => { console.log('App ready!'); e.app.quit(); }); }
else { process.exit(0); }
