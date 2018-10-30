const RPC = require('discord-rpc');
const client = new RPC.Client({ transport: 'ipc' });

client.on('ready', () => {
	console.log('ready')
	client.setActivity({
		state:'ata',
		details:'kadjas',
		largeImageKey:"playing",
		largeImageText:"sakdjsada"
	})
})

client.login({ clientId:"501544639560679477" });