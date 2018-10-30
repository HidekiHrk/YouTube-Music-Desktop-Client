const { remote, ipcRenderer } = require('electron');
const fs = require('fs');
const ytdl = require('ytdl-core');
const RPC = require('discord-rpc');
const path = require('path');
const client = new RPC.Client({ transport: 'ipc' })
var previousPath = __dirname.slice(0, __dirname.length - __dirname.split(path.sep).pop().length)
const config = require(previousPath + '/config.json');
const pkg = require(previousPath + '/package.json')
const startTimestamp = new Date()
var clientid = config.clientId;
var isReady = false;
var currentPlaying = null;
var webView = document.getElementById('webview');

// Icon in Task Bar //

var tray = new remote.Tray(previousPath + '/img/icon2.png');
tray.setToolTip('Idling...');
tray.on('click', () => {
	remote.getCurrentWindow().show();
})


// Globals //

var in_search = false;

var is_playing = false;

// Functions //

function decode(str, idx){
	return String.fromCharCode(str.charCodeAt(idx));
}

function video_info(url, title, author) {
	this.url = url;
	this.title = title;
	this.author = author;
}

function setActivity(obj){
	ipcRenderer.send('activity', obj);
}

// ipcEvents //

ipcRenderer.on('ready', (event, arg) => {
	isReady = arg;
});

// WebView Events //

webview.addEventListener('media-started-playing', () =>{
	if(webview.getURL() !== currentPlaying.url){
		webview.getWebContents().executeJavaScript(`
			try{
				let botao = document.getElementsByClassName('toggle-player-page-button style-scope ytmusic-player-bar');
				botao[0].click();
			}
			catch(e){}
		`, { userGesture: true })

	}
	let ganzerozos = setInterval(() => {
		if(is_playing){
			is_playing = false
			let newTimeStamp = new Date()
			let playNotifi = new remote.Notification({title:pkg.productName, body:`\u{1F3B5} ${currentPlaying.title}\n\u{1F464} ${currentPlaying.author}`, icon:previousPath + '/img/ico.png'})
			playNotifi.show()
			setTimeout(() => {
				playNotifi.close();
			}, 5000)
			tray.setToolTip(`Playing - Music: ${currentPlaying.title} - ${currentPlaying.author}`)
			tray.setImage(previousPath + '/img/ico.png')
			setActivity({
				details:`\u{1F3B5} ${currentPlaying.title}`,
				state:`\u{1F464} ${currentPlaying.author}`,
				newTimeStamp,
				largeImageKey:config.playing,
				largeImageText: `YouTube Music v${pkg.version}`,
				smallImageKey:config.play,
				smallImageText: 'Playing',
				instance: false,
			})
			clearInterval(ganzerozos);
		}
	}, 300)
})

webview.addEventListener('media-paused', () => {
	is_playing = true;
	let newTimeStamp = new Date()
	tray.setToolTip(`Paused - Music: ${currentPlaying.title} - ${currentPlaying.author}`)
	tray.setImage(previousPath + '/img/ico.png')
	setActivity({
		details:`\u{1F3B5} ${currentPlaying.title}`,
		state:`\u{1F464} ${currentPlaying.author}`,
		newTimeStamp,
		largeImageKey:config.playing,
		largeImageText: `YouTube Music v${pkg.version}`,
		smallImageKey:config.pause,
		smallImageText: 'Paused',
		instance: false,
	})
})

webview.addEventListener('did-stop-loading', () => {
	let url = webview.getURL()
	let newTimeStamp = new Date()
	if(url.startsWith('https://music.youtube.com/search?q=')){
		if(!isReady){ return; }
		webview.getWebContents().executeJavaScript(`
			try{
				let video = document.getElementsByClassName('video-stream html5-main-video');
				video[0].pause();
			}
			catch(e){}
		`, { userGesture:true })
		in_search = true;
		let srch_qry = decodeURI(url.slice('https://music.youtube.com/search?q='.length, url.length)).replace(/\+/g, ' ');
		tray.setToolTip(`Searching: ${srch_qry}`)
		tray.setImage(previousPath + '/img/icon2.png')
		setActivity({
			details:'Searching...',
			state:`${'\u{1F50D}'} ${srch_qry}`,
			newTimeStamp,
			largeImageKey:config.idle,
			largeImageText: `YouTube Music v${pkg.version}`,
			smallImageKey:config.search,
			smallImageText: 'Searching',
			instance: false,
		});
	}
	else if(url.startsWith('https://music.youtube.com/watch?v=')){
		if(!isReady){ return; }
		let new_url = 'https://www.youtube.com/watch?v=' + url.slice('https://music.youtube.com/watch?v='.length, url.length)
		ytdl.getInfo(new_url, (err, info) => {
			currentPlaying = new video_info(url, info.title, info.author.name)
			is_playing = true;
			webview.getWebContents().executeJavaScript(`
			try{
				let video = document.getElementsByClassName('video-stream html5-main-video');
				video[0].play();
			}
			catch(e){}
			`, { userGesture:true })
		});
	}
	else{
		if(!isReady){ return; }
		setActivity({
			details:'Just idling...',
			state:'and making some stuff',
			startTimestamp,
			largeImageKey:config.idle,
			largeImageText: `YouTube Music v${pkg.version}`,
			instance: false,
		})
	}
	console.log(url);
});

// Control Function //

function manipulate_window(mode){
	switch(mode){
		case 'close':
			remote.getCurrentWindow().close();
			break;
		case 'minimize':
			remote.getCurrentWindow().minimize();
			break;
		case 'maximize':
			let win = remote.getCurrentWindow()
			let elcontrol = document.getElementById('control')
			if(!win.isMaximized()){
				win.maximize();
			}
			else{
				win.unmaximize();
			}
			break;
	}
}