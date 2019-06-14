const { app, BrowserWindow, Notification, NativeImage, Tray, ipcMain } = require('electron');
const RPC = require('discord-rpc');
var client = new RPC.Client({ transport: 'ipc' })
const config = require('./config.json');
//var startTimestamp = new Date();
var clientid = config.clientId;
const pckg = require('./package.json')
var rpcState = false;


//Util Functions//

function notify(obj, timeout=5, click=false){
	if(renderer_on){
		win.webContents.send('notify', [obj, timeout, click])
	}
}

// Window App //

function createWindow(){
	win = new BrowserWindow({width:800, height:500, minWidth:400, minHeight:250, icon:`${__dirname}/img/ico.png`, transparent: true, frame:false, resizable:true});
	win.setMenu(null);
	win.loadFile(`${__dirname}/front_end/index.html`);
	//win.openDevTools()
	win.on('closed', () => {
		win = null;
	})
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
	app.quit();
});

app.on('activate', () =>{
	if(win === null){
		createWindow()
	};
})

// Discord RPC Connection //

ipcMain.on('activity', (event, arg) => {
	client.setActivity(arg)
		.catch(console.error)
})

client.on('ready', () => {
	rpcState = true;
	client.setActivity({
		details: `Idling...`,
		state: 'Just Started...',
		largeImageKey: config.idle,
		largeImageText: 'three',
		instance: false
	})
	setInterval(() => {
		client.setActivity({
			details: `Idlinga...`,
			state: 'Just Started...',
			largeImageKey: config.idle,
			largeImageText: 'three',
			instance: false
		})
	}, 3000)
});



client.login({ clientId: clientid });