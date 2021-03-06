const fs = require('fs'); //import 'fs' or file system module of nodejs
const readline = require('readline');  //import 'readline' module of nodejs
let urb_pop_grow = [], urb_rur_population = [], year_object = [];
let count = 1,index = [];
let asia = ['ARM','AZE','BHR','BGD','BTN','BRN','KHM','CHN','CXR','CCK','IOT','GEO','HKG','IND','IDN','IRN','IRQ','ISR','JPN','JOR','KAZ','KWT','KGZ','LAO','LBN','MAC','MYS','MDV','MNG','MMR','NPL','PRK','OMN','PAK','PSE','PHL','QAT','SAU','SGP','KOR','LKA','SYR','TWN','TJK','THA','TUR','TKM','ARE','UZB','VNM','YEM'];

const rl = readline.createInterface({
	input: fs.createReadStream('indicators.csv') //reading file indicators.csv
});

rl.on('line', (line) => {
	let line_holder = line.match(/"[^"]+"|[^,]+/g); //regex for ignoring commas inside double codes
	if(count == 1){		
		index['Year'] = line_holder.indexOf('Year');
		index['CountryName'] = line_holder.indexOf('CountryName');
		index['IndicatorCode'] = line_holder.indexOf('IndicatorCode');
		index['Value'] = line_holder.indexOf('Value');
		index['CountryCode'] = line_holder.indexOf('CountryCode');
		count--;
	}
	if(line_holder[index['CountryCode']] == "IND" && (line_holder[index['IndicatorCode']] == "SP.URB.TOTL.IN.ZS" || line_holder[index['IndicatorCode']] == "SP.RUR.TOTL.ZS")) {
		if(year_object.find(x => x.year === line_holder[index['Year']]) == undefined) {
				let temp = { year : line_holder[index['Year']] }
				temp[line_holder[index['IndicatorCode']] == "SP.URB.TOTL.IN.ZS"?'urban':'rural'] = parseFloat(line_holder[index['Value']]);
				year_object.push(temp);
			}
			else {
				let index_of_year = year_object.findIndex(x => x.year === line_holder[index['Year']]);
				year_object[index_of_year][line_holder[index['IndicatorCode']] == "SP.URB.TOTL.IN.ZS"?'urban':'rural'] = parseFloat(line_holder[index['Value']]);
			}
		}
	if(line_holder[index['CountryCode']] === 'IND' && line_holder[index['IndicatorCode']] === 'SP.URB.GROW'){	//comparing for urban population growth
		urb_pop_grow.push({
			"Year" : parseInt(line_holder[index['Year']]),
			"urban_growth" : parseFloat(line_holder[index['Value']])
		});
	}
	if(((asia.find(x => x === line_holder[index['CountryCode']]) != undefined)) && line_holder[index['IndicatorCode']] == "SP.POP.TOTL") {
		if(urb_rur_population.find(x => x.year == line_holder[index['Year']]) == undefined) {
			temp = { year : line_holder[index['Year']] }
			temp[line_holder[index['CountryName']].replace(/\"/g,"")] = parseFloat(line_holder[index['Value']]);
			urb_rur_population.push(temp);
		}
		else {
			let index_of_year = urb_rur_population.findIndex(x => x.year === line_holder[index['Year']]);
			urb_rur_population[index_of_year][line_holder[index['CountryName']].replace(/\"/g,"")] = parseFloat(line_holder[index['Value']]);
		}
	}
})
.on('close', () => {
  urb_rur_population.sort((a,b) =>  b.Total_Population - a.Total_Population);
	fs.createWriteStream('urb-rur-total-pop.json').write(JSON.stringify(year_object,null,2)); //writing year_object to urb-rur-total-pop.json
	fs.createWriteStream('urb-pop-growth.json').write(JSON.stringify(urb_pop_grow,null,2));	//writing urb_pop_grow to urb-pop-growth.json
	fs.createWriteStream('asia-total-pop.json').write(JSON.stringify(urb_rur_population,null,2));	//writing urb_rur_population to asia-total-pop.json
	console.log('Created file\n1. urb-rur-total-pop.json\n2. urb-pop-growth.json\n3. asia-total-pop.json');
});