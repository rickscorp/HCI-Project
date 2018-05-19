var amtmatrix = {};

// 横画面での行数
amtmatrix.landscapeLineNum = 3;
// 縦画面での行数
amtmatrix.portrateColumnNum = 4;

amtmatrix.reverseOnLandscape = true;
amtmatrix.reverseOnPortrait = true;

amtmatrix.MainCanvas;
amtmatrix.MainCanvasPen;

amtmatrix.MainCanvasWidth = 0;
amtmatrix.MainCanvasHeight = 0;
amtmatrix.MainCanvasAspect = 0;

amtmatrix.MatrixX = 10;
amtmatrix.MatrixY = 1;
amtmatrix.MatrixWidth = 0;
amtmatrix.MatrixHeight = 0;
amtmatrix.MatrixAspect = 0;
amtmatrix.MatrixXReverse = false;
amtmatrix.MatrixYReverse = false;

amtmatrix.nextAddingSlideNum = -1;
amtmatrix.SlideZone = [];

amtmatrix.AnimationMode = '';
amtmatrix.AnimationMustRenderNextTime = false;
amtmatrix.AnimationStartTime = 0;
amtmatrix.AnimationEndTime = 0;
amtmatrix.AnimationReadyTimer;

amtmatrix.SlideConfig = [];

amtmatrix.setup = function(canvasElm, slides){
	amtmatrix.MainCanvas = canvasElm;
	amtmatrix.SlideConfig = slides;
	
	if( !amtmatrix.MainCanvas.getContext ){
		return false;
	}else{
		amtmatrix.MainCanvasPen = amtmatrix.MainCanvas.getContext('2d');
	}
	
	for(var i = 0; amtmatrix.SlideConfig.length > i; i++){
		if(!('imagelist' in amtmatrix.SlideConfig[i])){
			amtmatrix.SlideConfig[i].imagelist = [];
		}
		if(!('bgcolour' in amtmatrix.SlideConfig[i])){
			amtmatrix.SlideConfig[i].bgcolour = '#000';
		}
		if(!('time' in amtmatrix.SlideConfig[i])){
			amtmatrix.SlideConfig[i].time = 6000;
		}
	}
	
	hotcake.addEventLoad(amtmatrix.launch);
	setTimeout(amtmatrix.launch, 1000);
}

amtmatrix.launched = false;
amtmatrix.launch = function(){
	if(!amtmatrix.launched){
		amtmatrix.launched = true;
		
		amtmatrix.calcCanvasSize();
		if(hotcake.os === 'ios'){
			window.addEventListener('orientationchange', amtmatrix.calcCanvasSize);
		}else{
			window.addEventListener('resize', amtmatrix.calcCanvasSize);
		}
	}
}

amtmatrix.calcCanvasSize = function(){
	amtmatrix.setTimeoutLocal(); // stop all animation
	
	amtmatrix.MainCanvasWidth = Math.round(amtmatrix.MainCanvas.offsetWidth * hotcake.dpr);
	amtmatrix.MainCanvasHeight = Math.round(amtmatrix.MainCanvas.offsetHeight * hotcake.dpr);
	amtmatrix.MainCanvasAspect = amtmatrix.MainCanvasWidth / amtmatrix.MainCanvasHeight;
	amtmatrix.MainCanvas.width = amtmatrix.MainCanvasWidth;
	amtmatrix.MainCanvas.height = amtmatrix.MainCanvasHeight;
	
	if(amtmatrix.MainCanvasAspect > 1){
		// 横長の場合
		amtmatrix.MatrixY = amtmatrix.landscapeLineNum;
		amtmatrix.MatrixX = Math.ceil(amtmatrix.landscapeLineNum * amtmatrix.MainCanvasAspect);
		amtmatrix.MatrixHeight = amtmatrix.MainCanvasHeight / amtmatrix.MatrixY;
		amtmatrix.MatrixWidth = amtmatrix.MatrixHeight * 1;
		amtmatrix.MatrixXReverse = false;
		amtmatrix.MatrixYReverse = false;
		if(amtmatrix.reverseOnLandscape){
			amtmatrix.MatrixXReverse = true;
		}
	}else{
		// 縦長の場合
		amtmatrix.MatrixX = amtmatrix.portrateColumnNum;
		amtmatrix.MatrixY = Math.ceil(amtmatrix.portrateColumnNum / amtmatrix.MainCanvasAspect);
		amtmatrix.MatrixWidth = amtmatrix.MainCanvasWidth / amtmatrix.MatrixX;
		amtmatrix.MatrixHeight = amtmatrix.MatrixWidth * 1;
		amtmatrix.MatrixXReverse = false;
		amtmatrix.MatrixYReverse = false;
		if(amtmatrix.reverseOnLandscape){
			amtmatrix.MatrixYReverse = true;
		}
	}
	
	amtmatrix.MatrixAspect = amtmatrix.MatrixWidth / amtmatrix.MatrixHeight;
	
	amtmatrix.setTimeoutLocal(amtmatrix.resetAllMasumeAndStart, 200);
}

amtmatrix.makeMasumeAndStart = function(){
	while(amtmatrix.SlideZone.length < 3){
		var masumes = [];
		var newBGCache = new Image();
		var newFGCache = new Image();
		
		// 画像を読み込み
		amtmatrix.nextAddingSlideNum ++;
		if(amtmatrix.SlideConfig.length <= amtmatrix.nextAddingSlideNum){
			amtmatrix.nextAddingSlideNum = 0;
		}
		var addingSlideConfig = amtmatrix.SlideConfig[amtmatrix.nextAddingSlideNum];
		var addingImageList = addingSlideConfig.imagelist;
		
		var bigImageAllowed =  'allowbigimage' in addingSlideConfig ? addingSlideConfig.allowbigimage : 0;
		var tallImageAllowed = 'allowbigimage' in addingSlideConfig ? addingSlideConfig.allowtallimage : 0;
		var wideImageAllowed = 'allowbigimage' in addingSlideConfig ? addingSlideConfig.allowideimage : 0;
		
		var alreadyTaken = {};
		for(var y = 0; y < amtmatrix.MatrixY; y ++){
			for(var x = 0; x < amtmatrix.MatrixX; x ++){
				if((x + '/' + y) in alreadyTaken){
					continue;
				}
				alreadyTaken[x + '/' + y] = true;
				
				var type = 1;
				var direction = Math.floor(Math.random() * 4);
				if(addingSlideConfig.bgcolour){
					if(y % 2 === 0){
						type *= -1;
					}
					if(x % 2 === 0){
						type *= -1;
					}
					if(amtmatrix.nextAddingSlideNum % 2 === 0){
						type *= -1;
					}
				}
				
				var widthmasu = 1;
				var heightmasu = 1;
				if(
					bigImageAllowed &&
					y !== amtmatrix.MatrixY - 1 &&
					x !== amtmatrix.MatrixX - 1 &&
					!((x + 1) + '/' + (y + 1) in alreadyTaken) &&
					!((x + 1) + '/' + y in alreadyTaken) &&
					!(x + '/' + (y + 1) in alreadyTaken) &&
					Math.random() * 100 <= bigImageAllowed &&
					type > 0
				){
					widthmasu = 2;
					heightmasu = 2;
					alreadyTaken[(x + 1) + '/' + (y + 1)] = true;
					alreadyTaken[(x + 1) + '/' + y] = true;
					alreadyTaken[x + '/' + (y + 1)] = true;
					
				}else if(
					tallImageAllowed &&
					y !== amtmatrix.MatrixY - 1 &&
					!(x + '/' + (y + 1) in alreadyTaken) &&
					Math.random() * 100 <= tallImageAllowed &&
					type > 0
				){
					heightmasu = 2;
					alreadyTaken[x + '/' + (y + 1)] = true;
					
				}else if(
					wideImageAllowed &&
					x !== amtmatrix.MatrixX - 1 &&
					!((x + 1) + '/' + y in alreadyTaken) &&
					Math.random() * 100 <= wideImageAllowed &&
					type > 0
				){
					widthmasu = 2;
					alreadyTaken[(x + 1) + '/' + y] = true;
				}
				
				masumes.push({
					x: x,
					y: y,
					left: Math.round(x * amtmatrix.MatrixWidth),
					top: Math.round(y * amtmatrix.MatrixHeight),
					width: Math.round(x * amtmatrix.MatrixWidth + amtmatrix.MatrixWidth * widthmasu) - Math.round(x * amtmatrix.MatrixWidth),
					height: Math.round(y * amtmatrix.MatrixHeight + amtmatrix.MatrixHeight * heightmasu) - Math.round(y * amtmatrix.MatrixHeight),
					widthmasu: widthmasu,
					heightmasu: heightmasu,
					type: (type > 0) ? 'image' : 'colour',
					direction: direction
				});
			}
		}
		
		// 逆転処理
		for(var i = 0; i < masumes.length; i++){
			if(amtmatrix.MatrixYReverse){
				masumes[i].top *= -1;
				masumes[i].top -= masumes[i].height;
				masumes[i].top += amtmatrix.MainCanvasHeight;
			}
			if(amtmatrix.MatrixXReverse){
				masumes[i].left *= -1;
				masumes[i].left -= masumes[i].width;
				masumes[i].left += amtmatrix.MainCanvasWidth;
			}
		}
		
		// 対象のリストから画像のsrcを取り出しておく
		var imageSrcsSelectCache = [];
		if(addingImageList.length){
			for(var m = 0; addingImageList.length > m; m++){
				imageSrcsSelectCache.push(addingImageList[m].src);
			}
			
			for(var i = 0; i < masumes.length; i++){
				if(masumes[i].type === 'image'){
					// ランダムで画像を選んでいく
					var num = parseInt(Math.random() * imageSrcsSelectCache.length);
					var src = imageSrcsSelectCache[num];
					imageSrcsSelectCache.splice(num, 1);
					
					// 万が一画像を全部使い切っちゃった場合、再度画像のsrcを取り出し直す
					if(imageSrcsSelectCache.length == 0){
						for(var m = 0; addingImageList.length > m; m++){
							imageSrcsSelectCache.push(addingImageList[m].src);
						}
					}
					
					masumes[i].photo = new Image();
					masumes[i].photo.src = src;
				}
			}
		}
		
		if('bgimage' in addingSlideConfig){
			newBGCache.src = addingSlideConfig.bgimage;
		}
		if('fgimage' in addingSlideConfig){
			newFGCache.src = addingSlideConfig.fgimage;
		}
		
		amtmatrix.SlideZone.push({
			num: amtmatrix.nextAddingSlideNum,
			config: amtmatrix.SlideConfig[amtmatrix.nextAddingSlideNum],
			masumes: masumes,
			bgimage: newBGCache,
			fgimage: newFGCache
		});
	}
	
	amtmatrix.StartShowingAnimation();
}
amtmatrix.dropCurrentMasumeAndStart = function(){
	amtmatrix.SlideZone.shift();
	amtmatrix.makeMasumeAndStart();
}
amtmatrix.resetAllMasumeAndStart = function(){
	amtmatrix.SlideZone = [];
	amtmatrix.makeMasumeAndStart();
}

amtmatrix.setTimeoutLocal = function(executethis, time){
	if(amtmatrix.AnimationReadyTimer){
		clearTimeout(amtmatrix.AnimationReadyTimer);
	}
	if(executethis && time){
		amtmatrix.AnimationReadyTimer = setTimeout(executethis, time);
	}else{
		amtmatrix.AnimationMode = ''; // Stop any animation
	}
}

amtmatrix.StartShowingAnimation = function(){
	amtmatrix.AnimationMode = 'open';
	amtmatrix.AnimationStartTime = (new Date()).getTime() + 200;
	amtmatrix.AnimationEndTime = amtmatrix.AnimationStartTime + 600;
	
	amtmatrix.AnimationLoop();
	
	console.log('slide #' + amtmatrix.SlideZone[0].num + ' started.')
	console.log('close at ' + amtmatrix.SlideZone[0].config.time + 'ms.');
	amtmatrix.setTimeoutLocal(amtmatrix.StartHidingAnimation, amtmatrix.SlideZone[0].config.time);
}
amtmatrix.StartHidingAnimation = function(){
	amtmatrix.AnimationMode = 'close';
	amtmatrix.AnimationStartTime = (new Date()).getTime() + 200;
	amtmatrix.AnimationEndTime = amtmatrix.AnimationStartTime + 600;
	
	amtmatrix.AnimationLoop();
	
	amtmatrix.setTimeoutLocal(amtmatrix.dropCurrentMasumeAndStart, 800);
}

amtmatrix.AnimationLoop = function(){
	var currentSlideConfig = amtmatrix.SlideZone[0].config;
	var currentMasumes = amtmatrix.SlideZone[0].masumes;
	var currentBGColour = currentSlideConfig.bgcolour;
	
	if(amtmatrix.AnimationMode || amtmatrix.AnimationMustRenderNextTime){
		amtmatrix.AnimationMustRenderNextTime = false;
		
		var wariai = hotcake.abs2wariai(amtmatrix.AnimationStartTime, (new Date()).getTime(), amtmatrix.AnimationEndTime);
		if(wariai < 0){
			wariai = 0;
		}
		wariai = hotcake.wariai2easeout(wariai);
		wariai = hotcake.wariai2easeout(wariai);
		
		// 背景色を描画
		amtmatrix.MainCanvasPen.fillStyle = currentBGColour;
		amtmatrix.MainCanvasPen.fillRect(
			0,
			0,
			amtmatrix.MainCanvasWidth,
			amtmatrix.MainCanvasHeight
		);
		
		// 背景画像を描画
		if('bgimage' in currentSlideConfig){
			var currentBGImage = amtmatrix.SlideZone[0].bgimage;
			
			if(currentBGImage.complete){
				if(currentSlideConfig.bgimagelayout === 'fill'){
					amtmatrix.MainCanvasPen.drawImage(
						currentBGImage,
						0,
						0,
						amtmatrix.MainCanvasWidth,
						amtmatrix.MainCanvasHeight
					);
				}else if(currentSlideConfig.bgimagelayout === 'contain'){
					// 画像のアス比を計算
					var thisImagezAspect = currentBGImage.width / currentBGImage.height;
					if(thisImagezAspect > amtmatrix.MainCanvasAspect){
						// 画像が横に長すぎる
						var dw = parseInt(amtmatrix.MainCanvasHeight * thisImagezAspect);
						var dh = amtmatrix.MainCanvasHeight;
						var dx = parseInt((amtmatrix.MainCanvasWidth - dw)　/ 2);
						var dy = 0;
					}else{
						// 画像が縦に長すぎる
						var dh = parseInt(amtmatrix.MainCanvasWidth / thisImagezAspect);
						var dw = amtmatrix.MainCanvasWidth;
						var dy = parseInt((amtmatrix.MainCanvasHeight - dh)　/ 2);
						var dx = 0;
					}
					
					amtmatrix.MainCanvasPen.drawImage(
						currentBGImage,
						dx,
						dy,
						dw,
						dh
					);
				}else{
					// 画像のアス比を計算
					var thisImagezAspect = currentBGImage.width / currentBGImage.height;
					if(thisImagezAspect > amtmatrix.MainCanvasAspect){
						// 画像が横に長すぎる
						var ih = currentBGImage.height;
						var iw = parseInt(ih * amtmatrix.MainCanvasAspect);
						var ix = parseInt((currentBGImage.width - iw) / 2);
						var iy = 0;
					}else{
						// 画像が縦に長すぎる
						var iw = currentBGImage.width;
						var ih = parseInt(iw / amtmatrix.MainCanvasAspect);
						var iy = parseInt((currentBGImage.height - ih) / 2);
						var ix = 0;
					}
					
					amtmatrix.MainCanvasPen.drawImage(
						currentBGImage,
						ix,
						iy,
						iw,
						ih,
						0,
						0,
						amtmatrix.MainCanvasWidth,
						amtmatrix.MainCanvasHeight
					);
				}
			}else{
				amtmatrix.AnimationMustRenderNextTime = true;
			}
		}
		
		// マス目ごとの画像など
		for(var i = 0; currentMasumes.length > i; i++){
			if(currentMasumes[i].type === 'image'){
				if(currentMasumes[i].photo){
					if(!currentMasumes[i].photo.complete){
						amtmatrix.MainCanvasPen.fillStyle = 'rgba(0,0,0,0.25)';
						amtmatrix.MainCanvasPen.fillRect(
							Math.round(currentMasumes[i].left),
							Math.round(currentMasumes[i].top),
							Math.round(currentMasumes[i].width),
							Math.round(currentMasumes[i].height)
						);
						amtmatrix.AnimationMustRenderNextTime = true;
						continue;
					}
				}else{
					amtmatrix.MainCanvasPen.fillStyle = 'rgba(0,0,0,0.1)';
					amtmatrix.MainCanvasPen.fillRect(
						Math.round(currentMasumes[i].left),
						Math.round(currentMasumes[i].top),
						Math.round(currentMasumes[i].width),
						Math.round(currentMasumes[i].height)
					);
					continue;
				}
				
				// 画像のアス比を計算
				var thisImagezAspect = currentMasumes[i].photo.width / currentMasumes[i].photo.height;
				var thisMasumezAspect = amtmatrix.MatrixAspect;
				
				if(thisImagezAspect > thisMasumezAspect){
					// 画像が横に長すぎる
					var ih = currentMasumes[i].photo.height;
					var iw = parseInt(ih * thisMasumezAspect);
					var ix = parseInt((currentMasumes[i].photo.width - iw) / 2);
					var iy = 0;
				}else{
					// 画像が縦に長すぎる
					var iw = currentMasumes[i].photo.width;
					var ih = parseInt(iw / thisMasumezAspect);
					var iy = parseInt((currentMasumes[i].photo.height - ih) / 2);
					var ix = 0;
				}
				
				amtmatrix.MainCanvasPen.drawImage(
					currentMasumes[i].photo,
					ix,
					iy,
					iw,
					ih,
					Math.round(currentMasumes[i].left),
					Math.round(currentMasumes[i].top),
					Math.round(currentMasumes[i].width),
					Math.round(currentMasumes[i].height)
				);
			}
			
			// カーテン効果
			if(amtmatrix.AnimationMode === 'open'){
				amtmatrix.MainCanvasPen.fillStyle = '#000';
				switch(currentMasumes[i].direction){
					case 0:
						amtmatrix.MainCanvasPen.fillRect(
							Math.round(currentMasumes[i].left),
							Math.round(currentMasumes[i].top),
							Math.round(currentMasumes[i].width),
							Math.round(currentMasumes[i].height * (1 - wariai))
						);
						break;
					case 1:
						amtmatrix.MainCanvasPen.fillRect(
							Math.round(currentMasumes[i].left),
							Math.round(currentMasumes[i].top),
							Math.round(currentMasumes[i].width * (1 - wariai)),
							Math.round(currentMasumes[i].height)
						);
						break;
					case 2:
						amtmatrix.MainCanvasPen.fillRect(
							Math.round(currentMasumes[i].left + currentMasumes[i].width * wariai),
							Math.round(currentMasumes[i].top),
							Math.round(currentMasumes[i].width * (1 - wariai)),
							Math.round(currentMasumes[i].height)
						);
						break;
					case 3:
						amtmatrix.MainCanvasPen.fillRect(
							Math.round(currentMasumes[i].left),
							Math.round(currentMasumes[i].top + currentMasumes[i].height * wariai),
							Math.round(currentMasumes[i].width),
							Math.round(currentMasumes[i].height * (1 - wariai))
						);
						break;
				}
			}else if(amtmatrix.AnimationMode === 'close'){
				amtmatrix.MainCanvasPen.fillStyle = '#000';
				switch(currentMasumes[i].direction){
					case 0:
						amtmatrix.MainCanvasPen.fillRect(
							Math.round(currentMasumes[i].left),
							Math.round(currentMasumes[i].top),
							Math.round(currentMasumes[i].width),
							Math.round(currentMasumes[i].height * wariai)
						);
						break;
					case 1:
						amtmatrix.MainCanvasPen.fillRect(
							Math.round(currentMasumes[i].left),
							Math.round(currentMasumes[i].top),
							Math.round(currentMasumes[i].width * wariai),
							Math.round(currentMasumes[i].height)
						);
						break;
					case 2:
						amtmatrix.MainCanvasPen.fillRect(
							Math.round(currentMasumes[i].left + currentMasumes[i].width * (1 - wariai)),
							Math.round(currentMasumes[i].top),
							Math.round(currentMasumes[i].width * wariai),
							Math.round(currentMasumes[i].height)
						);
						break;
					case 3:
						amtmatrix.MainCanvasPen.fillRect(
							Math.round(currentMasumes[i].left),
							Math.round(currentMasumes[i].top + currentMasumes[i].height * (1 - wariai)),
							Math.round(currentMasumes[i].width),
							Math.round(currentMasumes[i].height * wariai)
						);
						break;
				}
			}
		}
		
		// 前景画像を描画
		if('fgimage' in currentSlideConfig){
			var currentFGImage = amtmatrix.SlideZone[0].fgimage;
			
			if(currentFGImage.complete){
				if(currentSlideConfig.fgimagelayout === 'fill'){
					amtmatrix.MainCanvasPen.drawImage(
						currentFGImage,
						0,
						0,
						amtmatrix.MainCanvasWidth,
						amtmatrix.MainCanvasHeight
					);
				}else if(currentSlideConfig.fgimagelayout === 'contain'){
					// 画像のアス比を計算
					var thisImagezAspect = currentFGImage.width / currentFGImage.height;
					if(thisImagezAspect > amtmatrix.MainCanvasAspect){
						// 画像が横に長すぎる
						var dh = parseInt(amtmatrix.MainCanvasWidth / thisImagezAspect);
						var dw = amtmatrix.MainCanvasWidth;
						var dy = parseInt((amtmatrix.MainCanvasHeight - dh)　/ 2);
						var dx = 0;
					}else{
						// 画像が縦に長すぎる
						var dw = parseInt(amtmatrix.MainCanvasHeight * thisImagezAspect);
						var dh = amtmatrix.MainCanvasHeight;
						var dx = parseInt((amtmatrix.MainCanvasWidth - dw)　/ 2);
						var dy = 0;
					}
					
					amtmatrix.MainCanvasPen.drawImage(
						currentFGImage,
						dx,
						dy,
						dw,
						dh
					);
				}else{
					// 画像のアス比を計算
					var thisImagezAspect = currentFGImage.width / currentFGImage.height;
					if(thisImagezAspect > amtmatrix.MainCanvasAspect){
						// 画像が横に長すぎる
						var ih = currentFGImage.height;
						var iw = parseInt(ih * amtmatrix.MainCanvasAspect);
						var ix = parseInt((currentFGImage.width - iw) / 2);
						var iy = 0;
					}else{
						// 画像が縦に長すぎる
						var iw = currentFGImage.width;
						var ih = parseInt(iw / amtmatrix.MainCanvasAspect);
						var iy = parseInt((currentFGImage.height - ih) / 2);
						var ix = 0;
					}
					
					amtmatrix.MainCanvasPen.drawImage(
						currentFGImage,
						ix,
						iy,
						iw,
						ih,
						0,
						0,
						amtmatrix.MainCanvasWidth,
						amtmatrix.MainCanvasHeight
					);
				}
			}else{
				amtmatrix.AnimationMustRenderNextTime = true;
			}
		}
		
		// カーテン効果（全体）
		if(amtmatrix.AnimationMode === 'open'){
			amtmatrix.MainCanvasPen.fillStyle = '#000';
			amtmatrix.MainCanvasPen.globalAlpha = 1 - wariai;
			amtmatrix.MainCanvasPen.fillRect(
				0,
				0,
				amtmatrix.MainCanvas.width,
				amtmatrix.MainCanvas.height
			);
			amtmatrix.MainCanvasPen.globalAlpha = 1;
		}else if(amtmatrix.AnimationMode === 'close'){
			amtmatrix.MainCanvasPen.fillStyle = '#000';
			amtmatrix.MainCanvasPen.globalAlpha = wariai;
			amtmatrix.MainCanvasPen.fillRect(
				0,
				0,
				amtmatrix.MainCanvas.width,
				amtmatrix.MainCanvas.height
			);
			amtmatrix.MainCanvasPen.globalAlpha = 1;
		}
		
		
		if(wariai >= 1){
			amtmatrix.AnimationMode = '';
		}
		
		requestAnimationFrame(amtmatrix.AnimationLoop);
	}
}// JavaScript Document