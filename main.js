const { app, BrowserWindow, Notification, NativeImage, Tray, ipcMain } = require('electron');
const ytdl = require('ytdl-core');
const RPC = require('discord-rpc');
var client = new RPC.Client({ transport: 'ipc' })
const config = require('./config.json');
//var startTimestamp = new Date();
var clientid = config.clientId;
const pckg = require('./package.json')
var isready = false

// Window App //

function createWindow(){
	clientConnect();
	win = new BrowserWindow({width:800, height:500, minWidth:400, minHeight:250, icon:`${__dirname}/img/ico.png`, transparent: true, frame:false, resizable:true});
	win.setMenu(null);
	win.loadFile(`${__dirname}/front_end/index.html`);
	//win.openDevTools()
	win.on('closed', () => {
		win = null;
	})
	win.webContents.on('did-finish-load', () =>{
		win.webContents.send('ready', true)
	})
	notifi = new Notification({title:`${pckg.productName}`, body:`Welcome to ${pckg.productName} v${pckg.version}!`, icon:`${__dirname}/img/ico.png`});
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
	client.setActivity(arg).catch(e => {
		clientConnect();
	})
})

function rpc_connect_notifi(fail){
	if(!fail){
		let not2 = new Notification({title:pckg.productName, body:'Successfully connected to Discord RPC!', icon:__dirname + '/img/Discord-Logo-Color.png'})
		not2.show()
		setTimeout(() => {
			not2.close()
		}, 5000)
	}
	else{
		let segs = 5;
		let not = new Notification({title:pckg.productName, body:'Failed to connect to Discord RPC', body:`Attempting to connect in ${segs}s...`, icon: __dirname + '/img/Discord-Logo-Color.png'})
		not.show()
		setTimeout(() => {
			not.close();
		}, (segs - 1) * 1000)
	}
}

function clientConnect(){
	let logInterval = setInterval(() => {
		isready = true
		client = new RPC.Client({ transport: 'ipc' })
		client.login({ clientId: clientid })
			.catch(e => {
				//rpc_connect_notifi(true);
				isready = false
			}).then(() =>{
				if(isready){
					rpc_connect_notifi(false);
					clearInterval(logInterval);
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
		return;
	}, 5 * 1000)
}