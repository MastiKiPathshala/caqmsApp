/*************************************************************************
 *
 * $file: sensor.js
 *
 * @brief: web App back-end code, reading data from blobs and sending
 * it to browser.
 *
 * @author: Saurabh Singh
 *
 * @date: 15 May 2017 First version of web app back-end code
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 *
 *************************************************************************/
var express = require('express');
var router = express.Router();

var moment = require('moment-timezone');
var date = require('date-and-time');

/* GET list of unique SIG and their latest locations */
router.get('/gatewayLocations', function(req, res, next) {
	
	var dataType = "gps";
	log.debug("data type: "+dataType);
	var gatewayUniqueId = req.params.gatewayId;
	log.debug("gatewayUniqueId : "+gatewayUniqueId);
	
	var locationSet = [];
	var gatewayLocation = {};
	
	gatewayLocation.lat = [];
	gatewayLocation.lng = [];
	gatewayLocation.airQuality = [];
	gatewayLocation.gatId = [];
	
	var reqStatus = "OK";
	log.debug('GET request for gatewayLocations : ' + req);
	
	GetFinalDataFromFile(dataType,res,function(fileData){
		
		var data = fileData;
		var splitData = data.toString().split("\n");
		var length = splitData.length;
				
		for(var i =0;i<length; i++){
					
			var lastData = splitData[i];
			var parseData = JSON.parse(lastData);
				
			//log.debug("GatewayId: "+parseData.deviceid +" latitude: "+parseData.latitude + " longitude: "+parseData.longitude+ " qualityScore: "+parseData.qualityscore);
				
			var latitude = parseFloat(parseData.latitude);
			var longitude = parseFloat(parseData.longitude);
			var qualityscore = parseFloat(parseData.qualityscore);
			var gatewayId = parseData.deviceid;
						
			gatewayLocation.lat[i] = latitude; 
			gatewayLocation.lng[i] = longitude; 
			gatewayLocation.gatId[i] = gatewayId; 
			gatewayLocation.airQuality[i] = qualityscore
				
		}
		log.debug("LOCATION: "+JSON.stringify(gatewayLocation));
		res.json({status: reqStatus, results: gatewayLocation});
				
		log.debug('GET response for gatewayLocations : status = ' + reqStatus);
		return;
							
	})
});

/* GET temperature data*/
router.get('/temperature/:gatewayId', function(req, res, next) {
	
	var dataType = "temperature";
	var gatewayUniqueId = req.params.gatewayId;
	log.debug('GET request for dataType : ' + dataType + ', gatewayUniqueId : ' + gatewayUniqueId);
	
	var temperatureMetaData = [];
	
	var countGatewayId = 0;
	var countMatchedGatewayId = 0;
	var reqStatus = "OK";
	
	GetFinalDataFromFile(dataType,res,function(fileData){
		
		var data = fileData;
		var splitData = data.toString().split("\n");
		var numberOfRowsInFile = splitData.length;
				
		for(var i =0;i<numberOfRowsInFile; i++){
					
			var lastData = splitData[i];
			var parseData = JSON.parse(lastData);
				
			//log.debug("GatewayId: "+parseData.deviceid + " Temperature: "+parseData.averagetemperature+ " qualityScore: "+parseData.qualityscore);
			var gatewayId = parseData.deviceid;
						
			if ( gatewayId == gatewayUniqueId ) {
				temperatureData = {
					avgTemperature : parseFloat(parseData.avgtemperature),
					maxTemperature : parseFloat(parseData.maxtemperature),
					minTemperature : parseFloat(parseData.mintemperature),
					qualityScore : parseFloat(parseData.qualityscore),
					time : parseData.time
				}
				temperatureMetaData.push (temperatureData);
				countMatchedGatewayId++
							
			}else {
										
				countGatewayId ++;
			}
		}
		if( countGatewayId == numberOfRowsInFile ){
			log.debug("required gateway not found in blob data");
			res.json({status: "error", results: "required gateway not found in blob data "});
		}else{
			log.debug("TEMPERATURE: "+JSON.stringify(temperatureMetaData));
			res.json({status: reqStatus, results: temperatureMetaData});
				
			log.debug('GET response for gatewayLocations : status = ' + reqStatus);
			return;
		}
	})
});


/* GET humidity data */
router.get('/humidity/:gatewayId', function(req, res, next) {
	
	var dataType = "humidity";
	var gatewayUniqueId = req.params.gatewayId;
	log.debug('GET request for dataType : ' + dataType + ', gatewayUniqueId : ' + gatewayUniqueId);
	
	var humidityMetaData = [];
	
	var countGatewayId = 0;
	var countMatchedGatewayId = 0;
	var reqStatus = "OK";
	
	GetFinalDataFromFile(dataType,res,function(fileData){
		
		var data = fileData;
		var splitData = data.toString().split("\n");
		var numberOfRowsInFile = splitData.length;
				
		for(var i =0;i<numberOfRowsInFile; i++){
					
			var lastData = splitData[i];
			var parseData = JSON.parse(lastData);
					
			//log.debug("GatewayId: "+parseData.deviceid + " Humidity: "+parseData.avghumidity+ " qualityScore: "+parseData.qualityscore);
			var gatewayId = parseData.deviceid;
						
			if ( gatewayId == gatewayUniqueId ) {

				var humidityMetaDataPoint = {};
				humidityMetaDataPoint.avgHumidity = parseFloat(parseData.avghumidity);
				humidityMetaDataPoint.minHumidity = parseFloat(parseData.minhumidity);
				humidityMetaDataPoint.maxHumidity = parseFloat(parseData.maxhumidity);
				humidityMetaDataPoint.airQuality = parseFloat(parseData.qualityscore);
				humidityMetaDataPoint.time = parseData.time;
						
				humidityMetaData.push (humidityMetaDataPoint);
				
				countMatchedGatewayId++;
				
			}else {
										
				countGatewayId ++;
			}
				
		}
		if( countGatewayId == numberOfRowsInFile ){
									
			log.debug("required gateway not found in blob data");
			res.json({status: "error", results: "required gateway not found in blob data "});
		}else{
			log.debug("HUMIDITY: "+JSON.stringify(humidityMetaData));
			res.json({status: reqStatus, results: humidityMetaData});
				
			log.debug('GET response for gatewayLocations : status = ' + reqStatus);
			return;
		}
			
	})
});

/* GET so2 data*/
router.get('/so2/:gatewayId', function(req, res, next) {
	
	var dataType = "so2";
	var gatewayUniqueId = req.params.gatewayId;
	log.debug('GET request for dataType : ' + dataType + ', gatewayUniqueId : ' + gatewayUniqueId);
	
	var so2MetaData = [];
	
	var countGatewayId = 0;
	var countMatchedGatewayId = 0;
	var reqStatus = "OK";
				
	GetFinalDataFromFile(dataType,res,function(fileData){
				
		var data = fileData;
		var splitData = data.toString().split("\n");
		var numberOfRowsInFile = splitData.length;
				
		for(var i =0;i<numberOfRowsInFile; i++){
					
			var lastData = splitData[i];
			var parseData = JSON.parse(lastData);
				
			//log.debug("GatewayId: "+parseData.deviceid + " So2: "+parseData.so2+ " qualityScore: "+parseData.qualityscore);
			var gatewayId = parseData.deviceid;
						
			if ( gatewayId == gatewayUniqueId ) {
				
				var so2MetaDataPoint = {};
				so2MetaDataPoint.avgSo2 = parseFloat(parseData.avgso2);
				so2MetaDataPoint.minSo2 = parseFloat(parseData.minso2);
				so2MetaDataPoint.maxSo2 = parseFloat(parseData.maxso2);
				so2MetaDataPoint.airQuality = parseFloat(parseData.qualityscore);
				so2MetaDataPoint.time = parseData.time;

				so2MetaData.push (so2MetaDataPoint);

				countMatchedGatewayId ++;

			}else {

				countGatewayId ++;
			}

		}if( countGatewayId == numberOfRowsInFile ){
									
			log.debug("required gateway not found in blob data");
			res.json({status: "error", results: "required gateway not found in blob data "});
		}else{
			log.debug("SO2: "+JSON.stringify(so2MetaData));
			res.json({status: reqStatus, results: so2MetaData});
				
			log.debug('GET response for gatewayLocations : status = ' + reqStatus);
			return;
		}
	})
});

/* GET no2 data */
router.get('/no2/:gatewayId', function(req, res, next) {
	
	var dataType = "no2";
	var gatewayUniqueId = req.params.gatewayId;
	log.debug('GET request for dataType : ' + dataType + ', gatewayUniqueId : ' + gatewayUniqueId);
	
	var no2MetaData = [];
	
	var countGatewayId = 0;
	var countMatchedGatewayId = 0;
	var reqStatus = "OK";
	
	GetFinalDataFromFile(dataType,res,function(fileData){
	
		var data = fileData;
		var splitData = data.toString().split("\n");
		var numberOfRowsInFile = splitData.length;
				
		for(var i =0;i<numberOfRowsInFile; i++){
					
			var lastData = splitData[i];
			var parseData = JSON.parse(lastData);
				
			//log.debug("GatewayId: "+parseData.deviceid + " No2: "+parseData.no2+ " qualityScore: "+parseData.qualityscore);
			var gatewayId = parseData.deviceid;
						
			if ( gatewayId == gatewayUniqueId ) {
				
				var no2MetaDataPoint = {};
				no2MetaDataPoint.avgNo2 = parseFloat(parseData.avgno2);
				no2MetaDataPoint.minNo2 = parseFloat(parseData.minno2);
				no2MetaDataPoint.maxNo2 = parseFloat(parseData.maxno2);
				no2MetaDataPoint.airQuality = parseFloat(parseData.qualityscore);
				no2MetaDataPoint.time = parseData.time;
						
				no2MetaData.push (no2MetaDataPoint);

				countMatchedGatewayId ++;

			}else {
										
				countGatewayId ++;
			}
				
		}
		if( countGatewayId == numberOfRowsInFile ){
									
			log.debug("required gateway not found in blob data");
			res.json({status: "error", results: "required gateway not found in blob data "});
			
		}else{
			
			log.debug("NO2: "+JSON.stringify(no2MetaData));
			res.json({status: reqStatus, results: no2MetaData});
				
			log.debug('GET response for gatewayLocations : status = ' + reqStatus);
			return;
		}
	})
			
});

router.get('/kpiData/:dataType', function(req, res, next) {
	var deviceCount = 0;
	var kpiData = [];
	var query = registry.createQuery('SELECT * FROM devices');
	var onResults = function(err, results) {
		if (err) {
			log.error('Failed to fetch the results: ' + err.message);
			log.debug("Data Type: " + req.params.dataType + ", KPI data : " + JSON.stringify(kpiData));
			res.json({status: "OK", results: kpiData});
		} else {
			totalDeviceCount = results.length;

			results.forEach(function(twin) {
				deviceCount ++;
				deviceDetails = {
					deviceId : twin.deviceId,
					qualityScore : 0.0,
					qualityColour : "grey",
					time : "1970-01-01T09:05:00.0000000Z"
				};
				kpiData.push (deviceDetails);
			});
			GetFinalDataFromFile(req.params.dataType, res, function(fileData){

				var data = fileData;
				var splitData = data.toString().split("\n");
				var numberOfRowsInFile = splitData.length;

				for(var i =0;i<numberOfRowsInFile; i++){

					var lastData = splitData[i];
					log.debug (lastData);
					var parseData = JSON.parse(lastData);
					for (count = 0; count < totalDeviceCount; count ++) {
						//log.debug ("Blob : " + parseData.deviceid + ", Device : " + kpiData[count].deviceId);
						if (kpiData[count].deviceId === parseData.deviceid) {
							//log.debug ("Device Id matched between Blob and kpiData : " + parseData.deviceid );
							if (kpiData[count].time < parseData.time) {
								//log.debug ("More recent data available : " + parseData.deviceid + ", " + parseData.time);
								// This row is later than the stored one, overwrite it
								kpiData[count].qualityScore = parseFloat(parseData.qualityscore);
								//kpiData[count].qualityColour = parseData.qualitycolour;
								kpiData[count].qualityColour = "green";
								kpiData[count].time = parseData.time;
							};
						}
					}
				}
				log.debug (JSON.stringify(kpiData));
				if (deviceCount == totalDeviceCount) {
					log.debug("Data Type: " + req.params.dataType + ", KPI data : " + JSON.stringify(kpiData));
					res.json({status: "OK", results: kpiData});
				}
			});
		}
	};
	query.nextAsTwin(onResults);
});

//common functions for all sensor data type...

var GetFinalDataFromFile = function (dataType,res,callback) {
	var blobNameMismatchCounter = 0;
	GetRequiredBlobNames(dataType,function(reqBlobName){
		
		log.debug("required BlobName: "+reqBlobName);
	
		GetBlobNames(function(wholeDataForblobName){
		    
			var blobNameData = wholeDataForblobName;
			
			if( blobNameData == "error" ){
				
				res.json({status: "error", results: "Couldn't list blobs for container : read ECONNRESET"});
				
			}else {
				
				for(var i = 0;i< blobNameData.length;i++){
			
					var blobName = blobNameData[i].name;
					var fileName = dataType+".txt"
					log.debug(blobName);
					if(blobName.indexOf(reqBlobName) > -1){
					
						log.debug("blob Name: "+blobName);
				
						FetchBlobData(blobName,fileName,function(fileData){
						
							log.debug("output of file : "+fileName);
						
							if(fileData == "error"){
							
								log.debug("error in reding file");
								res.json({status: "error", results: "error in reding file: "+fileName});
							}else{
						
								callback(fileData);
							}
						});
					}else{
						
						blobNameMismatchCounter ++;
						
						log.trace("error in matching blob name: "+" blobNameMismatchCounter: "+blobNameMismatchCounter+" wholeDataForblobName.length: "+wholeDataForblobName.length);
						var noOfBlobs = wholeDataForblobName.length
						
						if( blobNameMismatchCounter == noOfBlobs) {
						
							log.debug("error in matching blob name");
							res.json({status: "error", results: "blob not found in the container: "+containerName});
							
						}
					}
				}
			}
		});	
	})
}

var GetRequiredBlobNames = function (dataType,callback) {
	
	var date = require('date-and-time');
	var now = new Date();

	var currentTime = date.format(now, 'YYYY/MM/DD HH:mm A [GMT]Z', true);
	var splitCurrentTime = currentTime.split("/");

	var year = splitCurrentTime[0];
	var month = splitCurrentTime[1];

	var getDateHour = splitCurrentTime[2].split(" ");
	var date = getDateHour[0];

	var getHour = getDateHour[1].split(":");
	var hour = getHour[0];

	var requiredBlobName = "telemetry/"+dataType+"-metadata"+"/"+year+"/"+month+"/"+date+"/"+hour;
	
	callback(requiredBlobName);

}

var GetBlobNames = function (callback) {
	
	blobService.listBlobsSegmented(containerName, null, function(err, result) {
		
		if (err) {
		
			log.debug("Couldn't list blobs for container: ", containerName);
			log.error(err);
			callback("error");

		} else {
			log.debug('Successfully listed blobs for container: '+ containerName);
			var data = result.entries;
			callback(data);
		}
	});	
}
var FetchBlobData = function (blobName,fileName,callback) {
	
	blobService.getBlobToStream(containerName, blobName, fs.createWriteStream('/tmp/'+fileName), function(error, result, response) {
		
		if (!error) {
		
			var data = fs.readFile('/tmp/'+fileName,function(err,data){
			//var data = fs.readFile('temperature1.txt',function(err,data){

				var fss = require('extfs');
 
				var empty = fss.isEmptySync('/tmp/'+fileName);
				//var empty = fss.isEmptySync('temperature1.txt');
					console.log(empty);
									
				if(err){
					
					log.debug("error while reading file: "+err);
					callback("error");
					
				}else {
					
					if(empty === true){
						
						log.debug("Error: file empty");
						callback("error");
						
					}else {
						
						callback(data);
					}	
				}
			})
			
		}else{
			
			log.debug(error);
		}
	})
}

module.exports = router; 
