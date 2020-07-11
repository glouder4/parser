const express = require("express"); 
const request = require('request');
const requestP = require('request-promise');
const cheerio = require("cheerio"); 
var urlencode = require('urlencode');
const xl = require('excel4node');
const fs = require('fs');
var app = express();

var wb = new xl.Workbook();
var ws = wb.addWorksheet('Sheet 1');
var option;
var style = wb.createStyle({
  font: {
    color: '#000000',
    size: 12,
  },
  numberFormat: '$#,##0.00; ($#,##0.00); -',
});
var Title;var makedRequest = 1;var ProductList = 14;
var productsListUrls = []; var productsList = []; var countOfProducts = 0;var productPackAttribs = []; var resultCountOfProducts = 1;
var categoryPhotosOrig = [];var categoryPhotoList = [];

var initURLS = ['http://plitka02.ru/keramicheskiy-granit/italon?limit_col=16&page_col=2'];
var countOfRequest = initURLS.length;
var photoPath = 'http://plitka02.ru/image/cache/data/';

var getResult = (path,$,id) =>{
	return new Promise(function (resolve,reject) {
		if($(path)[id].attribs.src != undefined){
			resolve($(path)[id].attribs.src,id);
		}
		else reject('undefined');
	})
}
var makePath = (path,response) =>{
	return new Promise	(function(resolve,reject){
		if(response.split(path)[1] != undefined){
			fs.stat(response.split(path)[1], function(err) {
			    if (!err) {
			        resolve(true);
			    }
			    if (err.code === 'ENOENT') {		    	
			    	var photoName = response.split(path)[1].split('/')[response.split(path)[1].split('/').length - 1];
			        fs.mkdir('images/'+response.split(path)[1].split(photoName)[0],{ recursive: true },function(err){
			        	if(err) reject(err);
			        	else resolve([
			        		{
			        			'url':response,
			        			'path':response.split(path)[1].split(photoName)[0],
			        			'photoName': photoName
			        		}
			        	]);
			        });
			    }
			    else{
			    	console.log(51,err);

			    }
			});
		}
		else{
			path = 'http://plitka02.ru/image/cache/parsing/';
			fs.stat(Title+response.split(path)[1], function(err) {
			    if (!err) {
			        resolve(true);
			    }
			    if (err.code === 'ENOENT') {		    	
			    	var photoName = response.split(path)[1].split('/')[response.split(path)[1].split('/').length - 1];
			        fs.mkdir('images/'+response.split(path)[1].split(photoName)[0],{ recursive: true },function(err){
			        	if(err) reject(err);
			        	else resolve([
			        		{
			        			'url':response,
			        			'path':response.split(path)[1].split(photoName)[0],
			        			'photoName': photoName
			        		}
			        	]);
			        });
			    }
			    else{
			    	console.log(77,err);
			    }
			});
		}
	})
}
var getProductList= (url,path) =>{
	return new Promise	(function(resolve,reject){
		var productsOption = {
		    uri: url,
		    transform: function (body) {
		        return cheerio.load(body);
		    }
		};
		requestP(productsOption).then(function ($) {	
			categoryPhotosOrig.push($('.product_left>a>img')[0].attribs.src);
			categoryPhotoList.push({
				Title:$('h1').text(),
				Photo:categoryPhotosOrig[ProductList]
			});	
			var getAttribsFromTD = [];
			$('#tab_upacovka>table>tbody>tr').find('td').each((i,op) => {
			    getAttribsFromTD[i] = $(op).text();			    
			})
			for(var i = 0 ; i < $('.span4.product-block').length;i++){
				productsList[countOfProducts] = $(path)[i].attribs.href;
				productPackAttribs[countOfProducts] = {
					'countInPackM2':getAttribsFromTD[2],
					'countInPack':getAttribsFromTD[3],
					'AVGweightM2':getAttribsFromTD[4],
					'AVGweight':getAttribsFromTD[5]
				}
				getAttribsFromTD.splice(0,6);			
				countOfProducts++;
			}
			resolve(true);
		}).catch(function(err){
			console.log(118,err);
			reject('smth-wrong');
		})
	})
};
var gettedProducts = 0;
function getProductsAttribs(url){
	return new Promise	(function(resolve,reject){		
		var productsOption = {
		    uri: url,
		    transform: function (body) {
		        return cheerio.load(body);
		    }
		};
		requestP(productsOption).then(function ($) {
			gettedProducts++;
			resultCountOfProducts++;
			getResult('.span6>.image>a>img',$,0).then(function(response){
				makePath('http://plitka02.ru/image/cache/data/',response).then(function(res){				
					//request(res[0].url).pipe(fs.createWriteStream('images/'+res[0].path+res[0].photoName)).on('close', function(){
						var price = '';
						for(var i = 0 ; i < $('.price_sklad_box>.row-fluid>.price').text().split('').length;i++){
							if($('.price_sklad_box>.row-fluid>.price').text().split('')[i] != ' ') price += $('.price_sklad_box>.row-fluid>.price').text().split('')[i];
						}		
						ws.cell(resultCountOfProducts, 1).number(resultCountOfProducts).style(style);//sku
						ws.cell(resultCountOfProducts, 2).string($('h1').text()).style(style);
						ws.cell(resultCountOfProducts, 3).string($('.attr>a').text()).style(style);
						ws.cell(resultCountOfProducts, 4).string($('.attr>span>a').text()).style(style);
						ws.cell(resultCountOfProducts, 9).string(price.split('р')[0]).style(style);
						ws.cell(resultCountOfProducts, 11).string(encodeURI(res[0].url)).style(style);
						ws.cell(resultCountOfProducts, 12).string($('.attr>span>a').text()).style(style);
						ws.cell(resultCountOfProducts, 13).string($('.span6>.sizes>span:not([itemprop="width"]):not([itemprop="height"])').text()).style(style);
						ws.cell(resultCountOfProducts, 14).string($('.span6>.sizes>span[itemprop="width"]').text()).style(style);
						ws.cell(resultCountOfProducts, 15).string($('.span6>.sizes>span[itemprop="height"]').text()).style(style);
						if($('.span6>.attr').text().split('Поверхность:')[1] != undefined) ws.cell(resultCountOfProducts, 16).string($('.span6>.attr').text().split('Поверхность:')[1]).style(style);
						if($('.span6>.attr').text().split('Назначение:')[1] != undefined) ws.cell(resultCountOfProducts, 17).string($('.span6>.attr').text().split('Назначение:')[1].split('\n')[0]).style(style);
						if($('.span6>.attr').text().split('Страна:')[1] != undefined) ws.cell(resultCountOfProducts, 18).string($('.span6>.attr').text().split('Страна:')[1].split('\n')[0]).style(style)
						ws.cell(resultCountOfProducts, 19).string(' '+productPackAttribs[gettedProducts-1]['countInPackM2']).style(style);
						ws.cell(resultCountOfProducts, 20).string(' '+productPackAttribs[gettedProducts-1]['countInPack']).style(style);
						ws.cell(resultCountOfProducts, 21).string(' '+productPackAttribs[gettedProducts-1]['AVGweightM2']).style(style);
						ws.cell(resultCountOfProducts, 22).string(' '+productPackAttribs[gettedProducts-1]['AVGweight']).style(style);						
						for(var i = 0 ; i < categoryPhotoList.length;i++){
							if( (categoryPhotoList[i].Title == $('.attr>a').text()) || (categoryPhotoList[i].Title == ("Керамическая плитка "+$('.attr>a').text()) ) ){
								ws.cell(resultCountOfProducts, 23).string(categoryPhotoList[i].Photo).style(style);
								break;
							}
							else if(i == categoryPhotoList.length-1){
								console.log(categoryPhotoList[i].Title,"Керамическая плитка "+$('.attr>a').text());
								console.log(166,$('h1').text(),$('.attr>a').text(),'not-found');
							}
						}
						if(gettedProducts == productsList.length){
							console.log('Товары получены.');
							if(makedRequest == countOfRequest){
								wb.write('uploads/products.xlsx', function(err, stats) {
								  if (err) {
								    console.error(err);
								  } else {
								  	console.log('Работа завершена.');
								    process.exit(-1);
								  }
								});								
							}
							else{
								makedRequest++;
								ProductList = 0;
								gettedProducts = 0;
								categoryPhotosOrig = [];
								Initialise(initURLS[makedRequest-1],photoPath);
							}
						}
						else{
							console.log('Получено',gettedProducts,'товаров из',productsList.length);
							console.log('Всего товаров: '+(resultCountOfProducts-1));
							getProductsAttribs(productsList[gettedProducts])
						}
					//});
				}).catch(function(err){
					console.log(196,err);
				})
			}).catch(function(err){
				console.log(198,err);
			})
		}).catch(function(err){
			console.log(201,err);
		})
	})
}
function makeProductRequest($){
	setTimeout(function(){
		getProductList(productsListUrls[ProductList],'.span4>.product-inner>.image>a:first-child').then(function(){			
			ProductList++;			
			if(ProductList < $('.product-block').length){
				console.log('Получено',ProductList,'списков товаров из',productsListUrls.length);											
				makeProductRequest($);
			}
			else{
				console.log('Получено',ProductList,'списков товаров из',productsListUrls.length);
				console.log('Получены все списки, получение товаров.');					
				getProductsAttribs(productsList[0]).then(function(){
					process.exit(-1);
				});
			}											
		}).catch(function(err){
			console.log(205,err);
		});										
	},1000)
}
function Initialise(url,path){	
	var countOfCategories = 1;	
	productsListUrls = [];
	productsList = [];
	countOfProducts = 0;
	setTimeout(function(){
		options = {
		    uri: url,
		    transform: function (body) {
		        return cheerio.load(body);
		    }
		};
		console.log('Запуск успешен. Отправляю запросы.');	
		requestP(options).then(function ($) {			
			for(var i = 0 ; i < $('.product-block').length;i++){
				getResult('.product-block>div>a>img',$,i).then(function(response){		
					makePath(path,response).then(function(res){	
					console.log(res[0].url);					
						request(encodeURI(res[0].url)).pipe(fs.createWriteStream('images/'+res[0].path+res[0].photoName)).on('close', function(){													
							productsListUrls[countOfCategories-1] = $('.product-block>.image>a')[countOfCategories-1].attribs.href;	
							if(countOfCategories == $('.product-block').length){
								console.log('Фотографии скачаны,категории получены. Категорий '+countOfCategories+'. Получаю списки..');								
								makeProductRequest($);
							}			
							countOfCategories++;
						});	
					}).catch(function(err){
						console.log(err);
					});			
				}).catch(function(err){
					console.log(err);
				});	
			}
		})
		.catch(function (err) {
		    // Crawling failed or Cheerio choked...
		});
	},2000)
}
ws.cell(1, 1).string('Main SKU').style(style);
ws.cell(1, 2).string('Name').style(style);
ws.cell(1, 3).string('Category').style(style);
ws.cell(1, 4).string('Parent Category').style(style);
ws.cell(1, 5).string('Parent Category').style(style);
ws.cell(1, 6).string('Parent Category').style(style);
ws.cell(1, 7).string('Parent Category').style(style);
ws.cell(1, 8).string('Quantity').style(style);
ws.cell(1, 9).string('Price').style(style);
ws.cell(1, 10).string('Description').style(style);
ws.cell(1, 11).string('Main photo').style(style);
ws.cell(1, 12).string('Manufacturer').style(style);
ws.cell(1, 13).string('Thikness').style(style);
ws.cell(1, 14).string('Width').style(style);
ws.cell(1, 15).string('Height').style(style);
ws.cell(1, 16).string('Surface').style(style);
ws.cell(1, 17).string('Appointment').style(style);
ws.cell(1, 18).string('Country').style(style);
ws.cell(1, 19).string('countInPackM2').style(style);
ws.cell(1, 20).string('countInPack').style(style);
ws.cell(1, 21).string('AVGweightM2').style(style);
ws.cell(1, 22).string('AVGweight').style(style);
ws.cell(1, 23).string('Category photo').style(style);
console.log('Эксель подготовлен');	

Initialise(initURLS[0],photoPath);
app.listen(3001);
module.exports.app = app;