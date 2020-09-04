var Bottleneck = require('bottleneck');
const util = require('util')

const dashboard = require('node-meraki-dashboard')("46daefdbc3dfa753519c96a1a97d2e910d2e2e94");
const BigNumber = require('bignumber.js');
let json2csv = require('json-2-csv');
const limOrg = new Bottleneck({
	  maxConcurrent: 1,
	  minTime: 250
	});

//getMxl3print
async function printGatewayIPforVlan200perLocation(orgid = "644577696667402575") { //644577696667402575 //644577696667403013 414361
	//console.log("0");
	var result="";
	//dashboard.organizations.get(orgid)  //get("644577696667402575")
	//.then(o=>console.dir(o));
	var org = await dashboard.organizations.get(orgid);//get("644577696667402575"); console.log("1");
	console.log("org: " + org.name);
	result += "Organization, Network (Name), VLAN , Network (subnet),VLAN Appliance IP" + "\n";
	var nets = await dashboard.networks.list(orgid);
	console.log("nets: " + nets.length);
	try{
		const allNetTasks = nets.map(net => {
			return limOrg.schedule(async () => {
				var vlans = await dashboard.vlans.list(net.id);
				if(vlans)
					vlans.map(vlan => console.log(org.name + "," + net.name + "," + vlan.id + "," + vlan.subnet + "," + vlan.applianceIp+ ""));
				if(vlans)
					vlans.map(vlan => result+=(org.name + "," + net.name + "," + vlan.id + "," + vlan.subnet + "," + vlan.applianceIp + "\n"));
			});
		});


		await Promise.all(allNetTasks);
		console.log("xxxxxxxxx");
		

	} catch(e) {console.log(e)}

	console.log(result);
	return result;
	/*
	await nets.forEach(async net => {
		//var vlans = await dashboard.vlans.list(net.id);
		console.dir(net.name);
		//console.log(net.name + ": " + vlan.applianceIp);
		await limOrg.schedule(async ()=>{
			try {
				var vlans = await dashboard.vlans.list(net.id);
				if(vlans)
					vlans.forEach(async vlan => {
						//console.log(vlan.id + ": " + vlan.name );
						//if(vlan.id == 200)
							//console.dir(vlan);
							result+=(org.name + "," + net.name + "," + vlan.id + "," + vlan.subnet + "," + vlan.applianceIp);
					})
				else console.log("no vlans in net: " + net.name);
				//console.log(vlans);
			} catch (e) {
				//console.log(e)
			}
		});

		
	});*/
	

}

async function getRules(networkid) {
	try {
		var rules = await dashboard.mx_l3_firewall.getRules(networkid);
	} catch(error) {console.log("error getRules: " + error)}
	//console.log("+++ finished getRules networkid:" + networkid);
		//return json2csvAsync(rules, {});
		return rules;

}

async function printOrg(orgid = "644577696667403013") {
	var r = {};
	r.nets = new Map();
	r.rules = new Map();
	var org = await dashboard.organizations.get(orgid);
	r.org = org;
	console.log(org.name);//return;
	var nets = await dashboard.networks.list(orgid);
	r.nets[orgid] = nets;
	for(var i=0;i<nets.length;i++) {
			var rules = await getRules(nets[i].id);
			r.rules[nets[i].id] = rules;
			//console.dir(rules);
			var rulesString = "";
			
			if (typeof rules !== "undefined") 
				rulesString = await json2csv.json2csvAsync(rules, {prependHeader    : false});
			console.log(nets[i].name + " / " + nets[i].id);
			console.log(rulesString);
			console.log(nets[i].name + " / " + nets[i].id);
			console.log(rulesString);
		}
	return r;
}

async function switchAMP(orgid = "644577696667402575", mode = "enabled") {
	var result = "";
	var org = await dashboard.organizations.get(orgid);
	console.log(org.name);//return;
	result += "Org: " + org.name + "\n";
	var nets = await dashboard.networks.list(orgid);
	//for(var i=0;i<nets.length;i++) {
		
			const allNetTasks = nets.map(net => {
				return limOrg.schedule(async () => {
					try {
					var customget = await dashboard.custom.get('https://api.meraki.com/api/v0/networks/'+net.id+'/security/malwareSettings');
					if(customget) {
						console.dir(customget);
						params = {"mode":mode};
						var custompost = await dashboard.custom.put('https://n145.meraki.com/api/v0/networks/'+net.id+'/security/malwareSettings', params);

						console.dir(net.id + ": " + custompost.mode);
						result += "Network " + net.name + ": AMP is " + custompost.mode +"\n";
						console.dir(custompost);
					} else console.log(" no customget: " + customget);
					} catch(e) {console.log("error while async switchamp: " + e);console.dir(e);}	
				});
			

			});

			//console.log("yyyyyyyyyyyy");
			await Promise.all(allNetTasks);
			//console.log("xxxxxxxxx");
		

		

		console.log(result);
		return result;
		//}

}
//engie  644577696667402575
async function listAMP(orgid = "644577696667403013") {
	var org = await dashboard.organizations.get(orgid);
	console.log(org.name);//return;
	var nets = await dashboard.networks.list(orgid);
}

exports.getSwitchAMP = (req, res) => {
	const orgid = req.params.orgid || "644577696667402575";
	const mode = req.params.mode || "enabled";
	switchAMP(orgid, mode)
		.then(r2=>res.render('switchamp', { result: r2 }));

}

exports.getMxl3printOrg = (req, res) => {
	const orgid = req.params.orgid;
	printOrg(orgid)
		.then((r) => {
			//console.dir(r);
			console.log(util.inspect(r, {showHidden: false, depth: null}));
			res.render('mxl3org', {
			    title: 'mxl3printOrg', r: r
			  });
		});

}
exports.getMxl3print = (req, res) => {
	//const mapid = req.params.mapid;
	console.log("mxl3print........");
	printGatewayIPforVlan200perLocation().
		then((result)=>res.render('mxl3vlan200', {
		    title: 'mxl3print ', result: result
		  }));
};