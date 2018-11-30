const { app, BrowserWindow, Notification, NativeImage, Tray, ipcMain } = require('electron');
const ytdl = require('ytdl-core');
const RPC = require('discord-rpc');
var client = new RPC.Client({ transport: 'ipc' })
const config = require('./config.json');
//var startTimestamp = new Date();
var clientid = config.clientId;
const pckg = require('./package.json')
var isready = false
var is_connected = false
var renderer_on = false

//Util Functions//

function notify(obj, timeout=5, click=false){
	if(renderer_on){
		win.webContents.send('notify', [obj, timeout, click])
	}
}

function rpc_connect_notifi(fail){
	if(!fail){
		notify({title:pckg.productName, body:'Successfully connected to Discord RPC!', icon:__dirname + '/img/Discord-Logo-Color.png'}, timeout=5)
	}
	else{
		let segs = 5;
		notify({title:pckg.productName, body:'Failed to connect to Discord RPC', body:`Attempting to connect in ${segs}s...`, icon: __dirname + '/img/Discord-Logo-Color.png'}, timeout=segs - 1)
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
	win.webContents.on('did-finish-load', () =>{
		win.webContents.send('ready', true)
		renderer_on = true
		clientConnect()
		notify({title:`${pckg.productName}`, body:`Welcome to ${pckg.productName} v${pckg.version}!`, icon:`${__dirname}/img/ico.png`}, timeout=10, click=true);
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

function clientConnect(){
	console.log('trying to connect')
	isready = true
	client = new RPC.Client({ transport: 'ipc' })
	client.login({ clientId: clientid })
		.catch(e => {
			console.log('failed to connect')
			rpc_connect_notifi(true);
			isready = false
		}).then(() =>{
			if(isready){
				rpc_connect_notifi(false);
			}
		})
	client.on('ready', () => {
		client.setActivity({
			details:'Just idling...',
			state:'and making some stuff',
			largeImageKey:config.idle,
			largeImageText: `YouTube Music v${pckg.version}`,
			instance: false,
		}).catch(console.error);
	});
	client.on('disconnect', () => {
		clientConnect();
	});
	return;
}
