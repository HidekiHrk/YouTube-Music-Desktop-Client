const { remote, ipcRenderer } = require('electron');
const fs = require('fs');
const ytdl = require('ytdl-core');
const RPC = require('discord-rpc');
const path = require('path');
const client = new RPC.Client({ transport: 'ipc' })
var previousPath = __dirname.slice(0, __dirname.length - __dirname.split(path.sep).pop().length)
const config = require(previousPath + '/config.json');
const pkg = require(previousPath + '/package.json')
//const startTimestamp = new Date()
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

/*function decode(str, idx){
	return String.fromCharCode(str.charCodeAt(idx));
}*/

function video_info(url, title, author, thumbnail) {
	this.url = url;
	this.title = title;
	this.author = author;
	this.thumbnail = thumbnail;
}

function setActivity(obj){
	ipcRenderer.send('activity', obj);
}

function notify(obj, timeout=5) {
	try{
		let not = new remote.Notification(obj);
		not.show()
		setTimeout(() => {
			not.close();
		}, timeout * 1000);
	}
	catch(e){}
	try{
		tray.displayBalloon({title:obj.title, content:obj.body, icon:obj.icon});
	}
	catch(e){}
}

// ipcEvents //

ipcRenderer.on('ready', (event, arg) => {
	isReady = arg;
	//console.log(isReady)
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
	let playingInterval = setInterval(() => {
		if(is_playing){
			is_playing = false
			//let newTimeStamp = new Date()
			notify({title:pkg.productName, body:`\u{1F3B5} ${currentPlaying.title}\n\u{1F464} ${currentPlaying.author}`, icon:previousPath + '/img/ico.png'})
			tray.setToolTip(`Playing - Music: ${currentPlaying.title} - ${currentPlaying.author}`)
			tray.setImage(previousPath + '/img/ico.png')
			setActivity({
				details:`\u{1F3B5} ${currentPlaying.title}`,
				state:`\u{1F464} ${currentPlaying.author}`,
				largeImageKey:config.playing,
				largeImageText: `YouTube Music v${pkg.version}`,
				smallImageKey:config.play,
				smallImageText: 'Playing',
				instance: false,
			})
			clearInterval(playingInterval);
		}
	}, 300)
})

webview.addEventListener('media-paused', () => {
	is_playing = true;
	//let newTimeStamp = new Date()
	tray.setToolTip(`Paused - Music: ${currentPlaying.title} - ${currentPlaying.author}`)
	tray.setImage(previousPath + '/img/ico.png')
	setActivity({
		details:`\u{1F3B5} ${currentPlaying.title}`,
		state:`\u{1F464} ${currentPlaying.author}`,
		largeImageKey:config.playing,
		largeImageText: `YouTube Music v${pkg.version}`,
		smallImageKey:config.pause,
		smallImageText: 'Paused',
		instance: false,
	})
})

webview.addEventListener('did-stop-loading', () => {
	let url = webview.getURL()
	//let newTimeStamp = new Date()
	switch(true){
		case url.startsWith('https://music.youtube.com/search?q='):
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
				largeImageKey:config.idle,
				largeImageText: `YouTube Music v${pkg.version}`,
				smallImageKey:config.search,
				smallImageText: 'Searching',
				instance: false,
			});
			break;
		case url.startsWith('https://music.youtube.com/watch?v='):
			if(!isReady){ return; }
			let new_url = 'https://www.youtube.com/watch?v=' + url.slice('https://music.youtube.com/watch?v='.length, url.length)
			ytdl.getInfo(new_url, (err, info) => {
				currentPlaying = new video_info(url, info.title, info.author.name, info.thumbnail_url)
				is_playing = true;
				webview.getWebContents().executeJavaScript(`
				try{
					let video = document.getElementsByClassName('video-stream html5-main-video');
					video[0].play();
				}
				catch(e){}
				`, { userGesture:true })
			});
			break;
		case url.startsWith('https://music.youtube.com/playlist?list='):
			if(!isReady){ return; }
			webview.getWebContents().executeJavaScript(`
				try{
					let video = document.getElementsByClassName('video-stream html5-main-video');
					video[0].pause();
				}
				catch(e){}
			`, { userGesture:true })
			break;
		default:
			if(!isReady){ return; }
			/*webview.getWebContents().executeJavaScript(`
				try{
					let video = document.getElementsByClassName('video-stream html5-main-video');
					video[0].pause();
				}
				catch(e){}
			`, { userGesture:true })*/
			setActivity({
				details:'Just idling...',
				state:'and making some stuff',
				largeImageKey:config.idle,
				largeImageText: `YouTube Music v${pkg.version}`,
				instance: false,
			})
			break;
		}
	//console.log(url);
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