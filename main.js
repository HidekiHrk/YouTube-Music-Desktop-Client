const { app, BrowserWindow, Notification, NativeImage, Tray } = require('electron');
const pckg = require('./package.json')

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