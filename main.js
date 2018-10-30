const { app, BrowserWindow, Notification, NativeImage, Tray, ipcMain } = require('electron');
const ytdl = require('ytdl-core');
const RPC = require('discord-rpc');
const client = new RPC.Client({ transport: 'ipc' })
const config = require('./config.json');
var startTimestamp = new Date();
var clientid = config.clientId;
const pckg = require('./package.json')


// Window App //

function createWindow(){
	win = new BrowserWindow({width:800, height:500, minWidth:400, minHeight:250, icon:`${__dirname}/img/ico.png`, transparent: true, frame:false, resizable:true});
	win.setMenu(null);
	win.loadFile(`${__dirname}/front_end/index.html`);
	//win.openDevTools()
	win.on('closed', () => {
		win = null;
	})
	notifi = new Notification({title:`${pckg.productName}`, body:`Welcome to ${pckg.productName} v${pckg.version}!`, icon:'./img/ico.png'});
	notifi.show()
	notifi.on('show', () => {
		try{
				setTimeout(function(){
				notifi.close();
			}, 10000)
		}
		catch(e){
			console.log(e)
		}		
	})
	notifi.on('click', () =>{
		win.show();
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
	client.setActivity(arg).catch(console.error)
})

client.on('ready', () => {
	win.webContents.on('did-finish-load', () =>{
		win.webContents.send('ready', true)
	})
	client.setActivity({
		details:'Just idling...',
		state:'and making some stuff',
		startTimestamp,
		largeImageKey:config.idle,
		largeImageText: `YouTube Music v${pckg.version}`,
		instance: false,
	}).catch(console.error);
});

function rpc_connect_notifi(fail){
	if(!fail){
		let not2 = new Notification({title:pckg.productName, body:'Successfully connected to Discord RPC!', icon:'./img/Discord-Logo-Color.png'})
		not2.show()
		setTimeout(() => {
			not2.close()
		}, 5000)
	}
	else{
		let segs = 5;
		let not = new Notification({title:pckg.productName, body:'Failed to connect to Discord RPC', body:`Attempting to connect in ${segs}s...`, icon:'./img/Discord-Logo-Color.png'})
		not.show()
		setTimeout(() => {
			not.close();
		}, segs * 1000)
	}
}

client.login({ clientId: clientid })
	.catch((e) => {
		console.log(e);
		let segs = 5
		rpc_connect_notifi(true);
		let logInterval = setInterval(() => {
			client.login({ clientId: clientid })
				.catch((e) => {
					rpc_connect_notifi(true);
				})
				.then(() => {
					clearInterval(logInterval);
				});
		}, segs * 1000)
	})
	.then(() => {
		rpc_connect_notifi(false);
	})