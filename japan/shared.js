// 設定 ------------------------------------
var TopPage = 'index.html'; // 日本語版トップページ
var EnglishTopPage = 'english/index.html'; // 英語版トップページ
var defaultOpenTime = 930; // デフォルトの開館時間
var defaultEndTime = 1630; // デフォルトの終了時間


// 一般 ------------------------------------
// パスの設定
var basePath = '';
var AbsoluteURI = /^([a-zA-Z0-9]+?):/;
var modPath = /^(.+\/)mod\/shared\.js/;
var localIndexPath1 = /\/index\.html/;
var localIndexPath2 = /^index\.html$/;
var pathSplitter = /\//;
function SetBasePath(){
	var scriptTags = document.getElementsByTagName('script');
	for(var i = 0; scriptTags.length > i; i++){
		if(scriptTags[i].hasAttribute('src')){
			if(scriptTags[i].getAttribute('src').match(modPath)){
				basePath = RegExp.$1;
				break;
			}
		}
	}
}
function AdjustURI(uri, compareable){
	if(!uri){
		return '';
	}
	if(location.protocol === 'http:' || location.protocol === 'https:' || compareable){
		uri = uri.replace(localIndexPath1, '/');
		uri = uri.replace(localIndexPath2, './');
	}
	if(uri.charAt(0) === '/'){
		return uri;
	}else if(AbsoluteURI.test(uri)){
		return uri;
	}else{
		return basePath + uri;
	}
}
function isThisURICurrentURI(uri){
	var testAnc = document.createElement('a');
	testAnc.href = AdjustURI(uri, true);
	var locationhref = AdjustURI(location.href, true);
	if(testAnc.href == locationhref){
		return true;
	}else{
		return false;
	}
}
function isTheseURIsSameURI(uri, uri2){
	var testAnc = document.createElement('a');
	var testAnc2 = document.createElement('a');
	testAnc.href = AdjustURI(uri, true);
	testAnc2.href = AdjustURI(uri2, true);
	if(testAnc.href == testAnc2.href){
		return true;
	}else{
		return false;
	}
}
if(location.protocol === 'http:' || location.protocol === 'https:'){
	hotcake.addEventBeforeLoad(function(){
		var allancs = document.getElementsByTagName('a');
		for(var i = 0; allancs.length > i; i++){
			if(allancs[i].getAttribute('href')){
				var hrefs = allancs[i].getAttribute('href');
				hrefs = hrefs.replace(localIndexPath1, '/');
				hrefs = hrefs.replace(localIndexPath2, './');
				allancs[i].setAttribute('href', hrefs);
			}
		}
		
	});
}
SetBasePath();



// データベースの読み込み
var WebsiteData = {};
document.write('<script src="' + basePath + '_database.js?' + parseInt((new Date()).getTime() / (10 * 60 * 1000)) + '"></script>');
var WebsiteDataSetupped = false;
function setupDatabase(){
	if(!WebsiteDataSetupped){
		WebsiteDataSetupped = true;
		
		WebsiteData["選択中のカテゴリ"] = {
			"カテゴリ名": "カテゴリ名設定なし",
			"クラス名": []
		};
		
		// メインメニューの構成の調整
		var MainMenuDB = hotcake.defaultPageLanguage === 'en' ? WebsiteData["英語版のメインメニューの構成"] : WebsiteData["日本語版のメインメニューの構成"];
		var linkPaths = location.href.split(pathSplitter);
		var mainmenuSelectedFound = false;
		while(linkPaths.length){
			for(var i = 0; MainMenuDB.length > i; i++){
				var obj = MainMenuDB[i];
				if(
					isTheseURIsSameURI(obj["リンク"], linkPaths.join('/')) ||
					isTheseURIsSameURI(obj["リンク"], linkPaths.join('/') + '/')
				){
					obj["クラス名"].push("selected");
					mainmenuSelectedFound = true;
					break;
				}
			}
			if(mainmenuSelectedFound){
				break;
			}else{
				linkPaths.pop();
			}
		}
		for(var i = 0; MainMenuDB.length > i; i++){
			var obj = MainMenuDB[i];
			if(obj["常に表示"] === "はい"){
				obj["クラス名"].push("showAllSizeScreen");
			}
		}
		
		// 小メニューの構成の調整
		var MiniMenuDB = hotcake.defaultPageLanguage === 'en' ? WebsiteData["英語版の小メニューの構成"] : WebsiteData["日本語版の小メニューの構成"];
		for(var i = 0; MiniMenuDB.length > i; i++){
			var obj = MiniMenuDB[i];
			if(obj["常に表示"] === "はい"){
				obj["クラス名"].push("showAllSizeScreen");
			}
		}
		
		// カテゴリの一覧とサブメニューの調整
		var linkPaths = location.href.split(pathSplitter);
		var categorySelectedFound = false;
		for(var i = 0; WebsiteData["カテゴリの一覧とサブメニュー"].length > i; i++){
			var obj = WebsiteData["カテゴリの一覧とサブメニュー"][i];
			for(var n = 0; obj["カテゴリページ"].length > n; n++){
				var cobj = obj["カテゴリページ"][n];
				if(!("クラス名" in cobj)){
					cobj["クラス名"] = [];
				}
				if(!("選択中" in cobj)){
					cobj["選択中"] = "いいえ";
				}
			}
		}
		while(linkPaths.length){ // 現在のディレクトリを順番に上に遡って一致するページがないかチェックするのだ
			L:for(var i = 0; WebsiteData["カテゴリの一覧とサブメニュー"].length > i; i++){
				var obj = WebsiteData["カテゴリの一覧とサブメニュー"][i];
				for(var n = 0; obj["カテゴリページ"].length > n; n++){
					var cobj = obj["カテゴリページ"][n];
					if(
						isTheseURIsSameURI(cobj["リンク"], linkPaths.join('/')) ||
						isTheseURIsSameURI(cobj["リンク"], linkPaths.join('/') + '/')
					){
						cobj["クラス名"].push("selected");
						cobj["選択中"] = "はい";
						categorySelectedFound = true;
						WebsiteData["選択中のカテゴリ"] = obj;
						break L;
						
					}else if("このページの下位にあると見なすディレクトリの一覧" in cobj){
						var kpkmdl = cobj["このページの下位にあると見なすディレクトリの一覧"];
						for(var m = 0; kpkmdl.length > m; m++){
							if(
								isTheseURIsSameURI(kpkmdl[m], linkPaths.join('/')) ||
								isTheseURIsSameURI(kpkmdl[m], linkPaths.join('/') + '/')
							){
								cobj["クラス名"].push("selected");
								cobj["選択中"] = "はい";
								categorySelectedFound = true;
								WebsiteData["選択中のカテゴリ"] = obj;
								break L;
							}
						}
					}
				}
			}
			if(categorySelectedFound){
				break;
			}else{
				linkPaths.pop();
			}
		}
	}
}



// 一般のラッパー要素
var MainHeader;
var SSMenuHolder;
var SSMenuSizer;
var mainElm;
var SubpageHeader;
var MainFooter;
var BackToTop;
hotcake.addEventBeforeLoad(function(){
	MainHeader = document.getElementById('MainHeader');
	SSMenuHolder = document.getElementById('SSMenuHolder');
	SSMenuSizer = document.getElementById('SSMenuSizer');
	mainElm = document.getElementsByTagName('main')[0];
	SubpageHeader = document.getElementById('SubpageHeader');
	MainFooter = document.getElementById('MainFooter');
	BackToTop = document.getElementById('BackToTop');
});




// メイン・サブヘッダ出力
function DrawGlobalHeaders(){
	setupDatabase();
	
	var MainMenuDB = hotcake.defaultPageLanguage === 'en' ? WebsiteData["英語版のメインメニューの構成"] : WebsiteData["日本語版のメインメニューの構成"];
	var MiniMenuDB = hotcake.defaultPageLanguage === 'en' ? WebsiteData["英語版の小メニューの構成"] : WebsiteData["日本語版の小メニューの構成"];
	
	var newHTML = '';
	
	if(hotcake.defaultPageLanguage === 'en'){
		newHTML += '<p id="SkipHeader"><a href="#PageContentTop" onfocus="setupSkipper()" onclick="setupSkipper();ScrollTo(\'PageContentTop\');">Skip to content</a></p>';
	}else{
		newHTML += '<p id="SkipHeader"><a href="#PageContentTop" onfocus="setupSkipper()" onclick="setupSkipper();ScrollTo(\'PageContentTop\');">ページ本文へ</a></p>';
	}
	
	newHTML += '<header id="MainHeader">';
	
	newHTML += '<div>';
	newHTML += '<div>';
	newHTML += '<p id="MHMainLogo">';
	if(hotcake.defaultPageLanguage === 'en'){
		newHTML += '<a href="' + AdjustURI(EnglishTopPage) + '">Currency Museum Bank of Japan</a>';
	}else{
		newHTML += '<a href="' + AdjustURI(TopPage) + '">日本銀行金融研究所貨幣博物館</a>';
	}
	newHTML += '</p>';
	newHTML += '<p id="MHOpenInfo">';
	if(hotcake.defaultPageLanguage === 'en'){
		newHTML += '<a href="' + AdjustURI('english/info/calendar/index.html') + '" class="openinfoview"></a>';
	}else{
		newHTML += '<a href="' + AdjustURI('info/calendar/index.html') + '" class="openinfoview"></a>';
	}
	newHTML += '</p>';
	newHTML += '</div>';
	newHTML += '</div>';
	
	newHTML += '<nav>';
	newHTML += '<ul id="LSMenu" class="iconmenu">';
	for(var i = 0; MainMenuDB.length > i; i++){
		var obj = MainMenuDB[i];
		newHTML += '<li class="' + obj["クラス名"].join(' ') + '"><a href="' + AdjustURI(obj["リンク"]) + '">' + obj["タイトル"] + '</a></li>';
	}
	if(hotcake.defaultPageLanguage === 'en'){
		newHTML += '<li class="onlyonss" id="MenuOnOff"><a onclick="MenuOnOff()">Others</a></li>';
	}else{
		newHTML += '<li class="onlyonss" id="MenuOnOff"><a onclick="MenuOnOff()">その他</a></li>';
	}
	newHTML += '</ul>';
	newHTML += '<div id="SSMenuHolder">';
	newHTML += '<div id="SSMenuSizer">';
	newHTML += '<ul id="SSMenu" class="iconmenu">';
	for(var i = 0; MainMenuDB.length > i; i++){
		var obj = MainMenuDB[i];
		if(obj["常に表示"] !== "はい"){
			newHTML += '<li class="' + obj["クラス名"].join(' ') + '"><a href="' + AdjustURI(obj["リンク"]) + '">' + obj["タイトル"] + '</a></li>';
		}
	}
	newHTML += '</ul>';
	newHTML += '</div>';
	newHTML += '</div>';
	newHTML += '<div id="MiniMenu">';
	newHTML += '<ul>';
	for(var i = 0; MiniMenuDB.length > i; i++){
		var obj = MiniMenuDB[i];
		if(obj["リンク"] === '文字サイズ選択ボタン'){
			newHTML += '<li class="' + obj["クラス名"].join(' ') + '"><a href="javascript:ToggleFontSizeSelectorButtonsOnOff()" id="FontSizeSelectorTrigger" aria-controls="FontSizeSelectorButtons" aria-expanded="false">' + obj["タイトル"] + '</a>';
			newHTML += '<div id="FontSizeSelectorButtons" aria-labelledby="FontSizeSelectorButtons" aria-expanded="false">';
			newHTML += '<ul>';
			if(hotcake.defaultPageLanguage === 'en'){
				newHTML += '<li><a href="javascript:SetTextSizeTo(3)" id="FontSizeChanger3">L</a></li>';
				newHTML += '<li><a href="javascript:SetTextSizeTo(2)" id="FontSizeChanger2">M</a></li>';
				newHTML += '<li><a href="javascript:SetTextSizeTo(1)" id="FontSizeChanger1">S</a></li>';
			}else{
				newHTML += '<li><a href="javascript:SetTextSizeTo(3)" id="FontSizeChanger3">大</a></li>';
				newHTML += '<li><a href="javascript:SetTextSizeTo(2)" id="FontSizeChanger2">中</a></li>';
				newHTML += '<li><a href="javascript:SetTextSizeTo(1)" id="FontSizeChanger1">小</a></li>';
			}
			newHTML += '</ul>';
			newHTML += '</div>';
			newHTML += '</li>';
		}else{
			newHTML += '<li class="' + obj["クラス名"].join(' ') + '"><a href="' + AdjustURI(obj["リンク"]) + '">' + obj["タイトル"] + '</a></li>';
		}
	}
	newHTML += '</li>';
	newHTML += '</ul>';
	newHTML += '</div>';
	newHTML += '</nav>';
	
	newHTML += '</header>';
	
	newHTML += '<header id="SubpageHeader">';
	newHTML += '<div>';
	newHTML += '<form action="http://www.google.com/cse">';
	newHTML += '<p>';
	if(hotcake.defaultPageLanguage === 'en'){
		newHTML += '<a href="' + AdjustURI(EnglishTopPage) + '">Currency Museum Bank of Japan</a>';
	}else{
		newHTML += '<a href="' + AdjustURI(TopPage) + '">日本銀行金融研究所貨幣博物館</a>';
	}
	newHTML += '</p>';
	if(hotcake.defaultPageLanguage === 'en'){
		newHTML += '<p>';
		newHTML += '<input type="text" name="q" value="" title="Enter search keywords" />';
		newHTML += '<input type="hidden" name="cx" value="002768466295832590583:yoykcob6tik" />';
		newHTML += '<input type="hidden" name="ie" value="UTF-8" />';
		newHTML += '</p>';
		newHTML += '<p>';
		newHTML += '<button type="submit">Search</button>';
		newHTML += '</p>';
	}else{
		newHTML += '<p>';
		newHTML += '<input type="text" name="q" value="" title="サイト内検索キーワードを入力" />';
		newHTML += '<input type="hidden" name="cx" value="002768466295832590583:wd3jnvksbcm" />';
		newHTML += '<input type="hidden" name="ie" value="UTF-8" />';
		newHTML += '</p>';
		newHTML += '<p>';
		newHTML += '<button type="submit">サイト内検索</button>';
		newHTML += '</p>';
	}
	newHTML += '</form>';
	newHTML += '</div>';
	newHTML += '</header>';
	document.write(newHTML);
}



// フッタ出力
var MainFooter;
function DrawGlobalFooters(){
	setupDatabase();
	
	var FootMenuDB = hotcake.defaultPageLanguage === 'en' ? WebsiteData["英語版のフッタメニューの構成"] : WebsiteData["日本語版のフッタメニューの構成"];
	
	var newHTML = '';
	
	newHTML += '<footer id="MainFooter">';
	newHTML += '<div id="MainFooterIllus">';
	newHTML += '<div id="MainFooterIllus1"></div>';
	newHTML += '<div id="MainFooterIllus2"></div>';
	newHTML += '<div id="MainFooterIllus3"></div>';
	newHTML += '<div id="MainFooterIllus4"></div>';
	newHTML += '</div>';
	
	newHTML += '<div id="MainFooterBody">';
	newHTML += '<ul>';
	
	for(var i = 0; FootMenuDB.length > i; i++){
		var obj = FootMenuDB[i];
		newHTML += '<li class="' + obj["クラス名"].join(' ') + '"><a href="' + AdjustURI(obj["リンク"]) + '">' + obj["タイトル"] + '</a></li>';
	}
	
	newHTML += '</ul>';
	newHTML += '<p lang="en">';
	newHTML += '<small>Copyright Bank of Japan All Rights Reserved.</small>';
	newHTML += '</p>';
	newHTML += '</div>';
	newHTML += '</footer>';
	
	newHTML += '<p id="BackToTop" class="hidden">';
	if(hotcake.defaultPageLanguage === 'en'){
		newHTML += '<a href="javascript:hotcake.scrollToTop()">Back to Top</a>';
	}else{
		newHTML += '<a href="javascript:hotcake.scrollToTop()">トップに戻る</a>';
	}
	newHTML += '</p>';
	
	document.write(newHTML);
	
	MainFooter = document.getElementById('MainFooter');
}



// ローカルメニューとパンくずリスト出力
function DrawLocalMenuAndDirectory(){
	setupDatabase();
	
	var CategoryObj = WebsiteData["選択中のカテゴリ"];
	
	// h2
	var LocalMenuAndDirectory = document.getElementById('LocalMenuAndDirectory');
	if(LocalMenuAndDirectory.getElementsByTagName('h2')[0]){
		var LocalMenuAndDirectoryH2 = LocalMenuAndDirectory.getElementsByTagName('h2')[0];
	}else{
		var LocalMenuAndDirectoryH2 = document.createElement('h2');
		if(LocalMenuAndDirectory.firstElementChild){
			LocalMenuAndDirectory.insertBefore(LocalMenuAndDirectoryH2, LocalMenuAndDirectory.firstElementChild);
		}else{
			LocalMenuAndDirectory.appendChild(LocalMenuAndDirectoryH2);
		}
	}
	LocalMenuAndDirectoryH2.innerHTML = CategoryObj["カテゴリ名"];
	
	if(!("カテゴリページ" in CategoryObj)){
		return false;
	}
	
	// LocalMenu
	if(document.getElementById('LocalMenu')){
		var LocalMenu = document.getElementById('LocalMenu');
	}else{
		var LocalMenu = document.createElement('ul');
		LocalMenu.id = "LocalMenu";
		if(document.getElementById('Directory')){
			LocalMenuAndDirectory.insertBefore(LocalMenu, document.getElementById('Directory'));
		}else{
			LocalMenuAndDirectory.appendChild(LocalMenu);
		}
	}
	var newHTML = '';
	for(var i = 0; CategoryObj["カテゴリページ"].length > i; i++){
		var obj = CategoryObj["カテゴリページ"][i];
		newHTML += '<li class="' + obj["クラス名"].join(' ') + '"><a href="' + AdjustURI(obj["リンク"]) + '">' + obj["タイトル"] + '</a></li>';
	}
	LocalMenu.innerHTML = newHTML;
	LocalMenu.className = 'li' + LocalMenu.getElementsByTagName('li').length;
	
	// Directory
	if(document.getElementById('Directory')){
		var Directory = document.getElementById('Directory');
	}else{
		var Directory = document.createElement('ul');
		Directory.id = "Directory";
		LocalMenuAndDirectory.appendChild(Directory);
	}
	var newHTML = '';
	var selectedPageOfCategory = -1;
	for(var i = 0; CategoryObj["カテゴリページ"].length > i; i++){
		var obj = CategoryObj["カテゴリページ"][i];
		if(obj["選択中"] === "はい"){
			selectedPageOfCategory = i;
			break;
		}
	}
	var firstPageObj = CategoryObj["カテゴリページ"][0];
	// if(selectedPageOfCategory >= 1){
	var selectedPageObj = CategoryObj["カテゴリページ"][selectedPageOfCategory];
	// }
	
	if(hotcake.defaultPageLanguage === 'en'){
		newHTML += '<li><a href="' + AdjustURI(EnglishTopPage) + '">Home</a></li>';
	}else{
		newHTML += '<li><a href="' + AdjustURI(TopPage) + '">Home</a></li>';
	}
	
	if(Directory.innerHTML){
		if(selectedPageOfCategory >= 1){
			newHTML += '<li><a href="' + AdjustURI(firstPageObj["リンク"]) + '">' + CategoryObj["カテゴリ名"] + '</a></li>';
			newHTML += '<li><a href="' + AdjustURI(selectedPageObj["リンク"]) + '">' + selectedPageObj["タイトル"] + '</a></li>';
			
		}else{
			newHTML += '<li><a href="' + AdjustURI(firstPageObj["リンク"]) + '">' + CategoryObj["カテゴリ名"] + '</a></li>';
			newHTML += '<li><a href="' + AdjustURI(selectedPageObj["リンク"]) + '">' + selectedPageObj["タイトル"] + '</a></li>';
		}
		newHTML += Directory.innerHTML;
		
	}else{
		if(selectedPageOfCategory >= 1){
			newHTML += '<li><a href="' + AdjustURI(firstPageObj["リンク"]) + '">' + CategoryObj["カテゴリ名"] + '</a></li>';
			newHTML += '<li>' + selectedPageObj["タイトル"] + '</li>';
			
		}else{
			if(CategoryObj["カテゴリ名"] === selectedPageObj["タイトル"]){
				newHTML += '<li>' + CategoryObj["カテゴリ名"] + '</li>';
			}else{
				newHTML += '<li>' + CategoryObj["カテゴリ名"] + '</li>';
				newHTML += '<li>' + selectedPageObj["タイトル"] + '</li>';
			}
		}
	}
	Directory.innerHTML = newHTML;
	
	// body
	if("クラス名" in CategoryObj){
		for(var i = 0; CategoryObj["クラス名"].length > i; i++){
			hotcake.addClass(document.body, CategoryObj["クラス名"][i]);
		}
	}
}



// カレンダーの処理
var EnglishMonthName = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var EnglishMonthNameShort = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var EnglishDayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
var EnglishDayNameShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var JapaneseDayNameShort = ['日', '月', '火', '水', '木', '金', '土'];
function LoadCalendar(){
	if(!WebsiteData["カレンダーデータ"]){
		return false;
	}
	
	var calendarDB = [];
	var calendarholder = document.createElement('div');
	calendarholder.innerHTML = WebsiteData["カレンダーデータ"][0];
	calendarselm = calendarholder.getElementsByTagName('table');
	
	for(var i = 0; calendarselm.length > i; i++){
		var year = 0;
		var month = 0;
		if(calendarselm[i].getElementsByClassName('year')){
			year = parseInt(calendarselm[i].getElementsByClassName('year')[0].innerHTML);
		}
		if(calendarselm[i].getElementsByClassName('month')){
			month = parseInt(calendarselm[i].getElementsByClassName('month')[0].innerHTML);
		}
		if(!year || !month){
			continue;
		}
		var tds = calendarselm[i].getElementsByTagName('td');
		for(var n = 0; tds.length > n; n++){
			var date = parseInt(tds[n].innerHTML);
			if(date){
				calendarDB.push({
					year: year,
					month: month,
					date: date,
					datecode: year * 10000 + month * 100 + date,
					class: tds[n].className,
					freetext: (tds[n].getAttribute('data-freetext') ? tds[n].getAttribute('data-freetext') : '')
				});
			}
		}
	}
	
	var openinfoviews = document.getElementsByClassName('openinfoview');
	if(openinfoviews.length){
		var currentdatetime = new Date();
		currentdatetime.setHours(currentdatetime.getHours() + 9);//時差固定化(+9:00)
		
		var currentyear = currentdatetime.getUTCFullYear();
		var currentmonth = currentdatetime.getUTCMonth() + 1;
		var currentdate = currentdatetime.getUTCDate();
		var currentdatecode = currentyear * 10000 + currentmonth * 100 + currentdate;
		var currenttime = currentdatetime.getUTCHours() * 100 + currentdatetime.getUTCMinutes();
		
		// 終了時間を同定
		var endtime = defaultEndTime;
		for(var i = 0; calendarDB.length > i; i++){
			if(calendarDB[i].datecode === currentdatecode){
				if(calendarDB[i].class.match(/extended(\d\d)(\d\d)/)){
					endtime = parseInt(RegExp.$1) * 100 + parseInt(RegExp.$2);
				}
				break;
			}
		}
		
		// 終了日を過ぎていたら翌日の予定を表示する
		if(endtime < currenttime){
			currentdatetime.setUTCDate(currentdatetime.getUTCDate() + 1);
			currentyear = currentdatetime.getUTCFullYear();
			currentmonth = currentdatetime.getUTCMonth() + 1;
			currentdate = currentdatetime.getUTCDate();
			currentdatecode = currentyear * 10000 + currentmonth * 100 + currentdate;
		}
		
		// 開館時間
		var openhour = parseInt(defaultOpenTime / 100);
		var openmins = defaultOpenTime - openhour * 100;
		
		// 終了時間
		var endhour = parseInt(endtime / 100);
		var endmins = endtime - endhour * 100;
		
		// 入館締め切り時間
		var nyujoshuryojikan = new Date();
		nyujoshuryojikan.setHours(endhour);
		nyujoshuryojikan.setMinutes(endmins - 30);
		var nyujoshuryohour = nyujoshuryojikan.getHours();
		var nyujoshuryomins = nyujoshuryojikan.getMinutes();
		
		// 分は2桁
		if(openmins < 10){
			openmins = '0' + openmins;
		}
		if(endmins < 10){
			endmins = '0' + endmins;
		}
		if(nyujoshuryomins < 10){
			nyujoshuryomins = '0' + nyujoshuryomins;
		}
		
		// 今日の情報
		var today;
		for(var i = 0; calendarDB.length > i; i++){
			if(calendarDB[i].datecode === currentdatecode){
				today = calendarDB[i];
				break;
			}
		}
		
		var newHTML = '<span>';
		if(hotcake.defaultPageLanguage === 'en'){
			newHTML += currentdate + ' ' + EnglishMonthName[currentmonth];
			if(today.class == 'closed'){
				newHTML += ': Closed';
			}else if(today.class == 'freetext'){
				newHTML += ': Open';
				newHTML += '</span><span>';
				newHTML += '<small>' + today.freetext + '</small>';
			}else{
				newHTML += ': Open';
				newHTML += '</span><span>';
				newHTML += '<small>'+openhour+':'+openmins+'-'+endhour+':'+endmins+' (no entry after '+nyujoshuryohour+':'+nyujoshuryomins+')</small>'
			}
		}else{
			newHTML += currentmonth + '月' + currentdate + '日';
			if(today.class == 'closed'){
				newHTML += 'は休館日です';
			}else if(today.class == 'freetext'){
				newHTML += 'は開館日です';
				newHTML += '</span><span>';
				newHTML += '<small>' + today.freetext + '</small>';
			}else{
				newHTML += 'は開館日です';
				newHTML += '</span><span>';
				newHTML += '<small>開館時間 '+openhour+':'+openmins+'～'+endhour+':'+endmins+' (入館は'+nyujoshuryohour+':'+nyujoshuryomins+'まで)</small>'
			}
		}
		newHTML += '</span>';
		
		for(var i = 0; openinfoviews.length > i; i++){
			openinfoviews[i].innerHTML = newHTML;
			if(today.class){
				hotcake.addClass(openinfoviews[i], today.class);
			}
		}
	}
	
	var calendarzones = document.getElementsByClassName('calendarzone');
	var defaultEndHour = parseInt(defaultEndTime / 100);
	var defaultEndMins = defaultEndTime - defaultEndHour * 100;
	if(calendarzones.length){
		for(var i = 0; calendarzones.length > i; i++){
			calendarzones[i].innerHTML = WebsiteData["カレンダーデータ"][0];
			var allTDs = calendarzones[i].getElementsByTagName('td');
			for(var n = 0; allTDs.length > n; n++){
				if(allTDs[n].className == 'freetext' && allTDs[n].getAttribute('data-freetext')){
					allTDs[n].innerHTML += '<small>' + allTDs[n].getAttribute('data-freetext') + '</small>';
					
				}else if(allTDs[n].className == 'closed'){
					allTDs[n].innerHTML += '<small>' + (hotcake.defaultPageLanguage === 'en' ? 'Closed' : '休館') + '</small>';
					
				}else if(allTDs[n].className.match(/extended(\d\d)(\d\d)/)){
					allTDs[n].innerHTML += '<small>' + (hotcake.defaultPageLanguage === 'en' ? '-' : '〜') + RegExp.$1 + ':' + RegExp.$2 + '</small>';
					
				}else if(allTDs[n].innerHTML){
					allTDs[n].innerHTML += '<small>' + (hotcake.defaultPageLanguage === 'en' ? '-' : '〜') + defaultEndHour + ':' + defaultEndMins + '</small>';
				}
			}
			if(hotcake.defaultPageLanguage === 'en'){
				TranslateCalendarJa2En(calendarzones[i]);
			}
		}
	}
}
var TranslateCalendarJa2En = function(elm){
	var captions = elm.getElementsByTagName("caption");
	for(var i = 0; captions.length > i; i++){
		var year = captions[i].getElementsByClassName("year")[0].innerHTML;
		var month = captions[i].getElementsByClassName("month")[0].innerHTML;
		captions[i].innerHTML = EnglishMonthNameShort[month] + '. ' + year;
	}
	var ths = elm.getElementsByTagName("th");
	for(var i = 0; ths.length > i; i++){
		for(var n = 0; JapaneseDayNameShort.length > n; n++){
			if(ths[i].innerHTML === JapaneseDayNameShort[n]){
				ths[i].innerHTML = EnglishDayNameShort[n];
			}
		}
	}
};
hotcake.addEventBeforeLoad(LoadCalendar);



// ヘッダの処理
function MenuOnOff(){
	if(hotcake.hasClass(MainHeader, 'menuon')){
		hotcake.removeClass(MainHeader, 'menuon');
		SSMenuHolder.style.height = '0';
	}else{
		hotcake.addClass(MainHeader, 'menuon');
		SSMenuHolder.style.height = SSMenuSizer.offsetHeight + 'px';
	}
}

var currentTextSize = 1;
var FontSizeSelectorButtons;
var FontSizeSelectorTrigger;
function　ToggleFontSizeSelectorButtonsOnOff(){
	if(FontSizeSelectorButtons.getAttribute('aria-expanded') == 'false'){
		FontSizeSelectorTrigger.setAttribute('aria-expanded', 'true');
		FontSizeSelectorButtons.setAttribute('aria-expanded', 'true');
	}else{
		FontSizeSelectorTrigger.setAttribute('aria-expanded', 'false');
		FontSizeSelectorButtons.setAttribute('aria-expanded', 'false');
	}
}

function SetTextSizeTo(n){
	if(!FontSizeSelectorButtons){
		FontSizeSelectorButtons = document.getElementById('FontSizeSelectorButtons');
		FontSizeSelectorTrigger = document.getElementById('FontSizeSelectorTrigger');
	}
	hotcake.bakecookie('cmtextsize', n);
	hotcake.removeClass(document.documentElement, 'textsize1');
	hotcake.removeClass(document.documentElement, 'textsize2');
	hotcake.removeClass(document.documentElement, 'textsize3');
	hotcake.addClass(document.documentElement, 'textsize' + n);
	FontSizeSelectorTrigger.setAttribute('aria-expanded', 'false');
	FontSizeSelectorButtons.setAttribute('aria-expanded', 'false');
}

hotcake.addEventBeforeLoad(function(){
	currentTextSize = 1;
	if(hotcake.cookie('cmtextsize')){
		currentTextSize = parseInt(hotcake.cookie('cmtextsize'));
	}
	if(currentTextSize + '' != parseInt(currentTextSize) + ''){
		currentTextSize = 1;
	}
	SetTextSizeTo(currentTextSize);
});



// アクセシビリティ
var setupSkipperEnabled = false;
function setupSkipper(){
	if(!setupSkipperEnabled){
		setupSkipperEnabled = true;
		var skipper = document.createElement('p');
		skipper.id = "PageContentTop";
		skipper.setAttribute('tabindex', '0');
		if(hotcake.defaultPageLanguage === 'en'){
			skipper.innerHTML = 'Page body from here';
		}else{
			skipper.innerHTML = 'ここからページ本文';
		}
		
		if(mainElm.getElementsByTagName('h1')){
			var h1 = mainElm.getElementsByTagName('h1')[0];
			h1.parentNode.insertBefore(skipper, h1);
		}else{
			mainElm.insertBefore(skipper, mainElm.firstChild);
		}
	}
}



// スクロール
function ScrollTo(elm, callbackfunc){
	var elm = hotcake.elmOfID(elm);
	var pos = hotcake.positionOf(elm, 'start');
	
	pos.y -= HeightOfHeader();
	if(pos.y < 0){
		pos.y = 0;
	}
	
	hotcake.startScrolling({
		y: pos.y,
		x: pos.x,
		callback: callbackfunc,
		maxScrollTime: 600
	});
	
	return false;
}
if(location.hash){
	hotcake.addEventLoad(function(){
		setTimeout(HashToScroll, 10);
	});
}
function HashToScroll(){
	var Hash = location.hash;
	Hash = Hash.slice(1);
	
	var elm = hotcake.elmOfID(Hash);
	var pos = hotcake.positionOf(elm, 'start');
	
	pos.y -= HeightOfHeader();
	if(pos.y < 0){
		pos.y = 0;
	}
	
	window.scrollTo(pos.x, pos.y);
}
function HeightOfHeader(){
	var height = 0;
	var viewport = hotcake.viewport();
	if(viewport.width <= 768){
		height = Math.round(MainHeader.offsetHeight + (viewport.width * 0.05));
	}
	return height;
}



// レイアウト調整
function MainElementSizeAdjust(){
	var viewport = hotcake.viewport();
	
	var mainStyle = getComputedStyle(mainElm);
	var SubpageHeaderStyle = getComputedStyle(SubpageHeader);
	var MainFooterStyle = getComputedStyle(MainFooter);
		
	var existingTop = 0;
	
	existingTop += parseFloat(mainStyle["margin-top"]);
	existingTop += parseFloat(mainStyle["padding-top"]);
	existingTop += parseFloat(mainStyle["margin-bottom"]);
	existingTop += parseFloat(mainStyle["padding-bottom"]);
	
	existingTop += parseFloat(SubpageHeaderStyle["margin-top"]);
	existingTop += parseFloat(SubpageHeaderStyle["margin-bottom"]);
	existingTop += SubpageHeader.offsetHeight;
	
	existingTop += parseFloat(MainFooterStyle["margin-top"]);
	existingTop += parseFloat(MainFooterStyle["margin-bottom"]);
	existingTop += MainFooter.offsetHeight;
	
	mainElm.style.minHeight = (viewport.height - existingTop) + 'px';
}
hotcake.addEventBeforeLoad(function(){
	if(hotcake.hasClass(document.body, 'subpage')){
		MainElementSizeAdjust();
		hotcake.addEventLoad(MainElementSizeAdjust);
		hotcake.addEvent(window, 'resize', MainElementSizeAdjust);
	}
});





// BackToTop
hotcake.addEventBeforeLoad(function(){
	hotcake.addEvent(window, 'scroll', checkBackToTopState);
	hotcake.addEvent(window, 'resize', checkBackToTopState);
});
function checkBackToTopState(){
	var viewport = hotcake.viewport();
	
	if(MainFooter){
		var availableBottomHeight = viewport.pageHeight - viewport.currentheight - viewport.y - (MainFooter.offsetHeight - BackToTop.offsetHeight * 0.4);
		var buttonBottom = availableBottomHeight < 0 ? parseInt(availableBottomHeight * -1) : 0;
		
		BackToTop.style.bottom = buttonBottom + 'px';
	}
	
	
	
	if(viewport.y < 200){
		BackToTop.className = 'hidden';
	}else{
		BackToTop.className = '';
	}
}



// 調査研究資料 ------------------------------------
function DBImageListViewShowImage(papernumber){
	var DBImageListView = document.getElementById('DBImageListView');
	var DBThumbnailList = document.getElementById('DBThumbnailList');
	
	var DBImageListViewSections = DBImageListView.getElementsByTagName('section');
	var DBThumbnailListItems = DBThumbnailList.getElementsByTagName('li');
	
	for(var i = 0; DBImageListViewSections.length > i; i++){
		if(DBImageListViewSections[i].id == 'DBImageListView' + papernumber){
			DBImageListViewSections[i].style.display = 'block';
		}else{
			DBImageListViewSections[i].style.display = 'none';
		}
	}
	
	for(var i = 0; DBThumbnailListItems.length > i; i++){
		var n = DBThumbnailListItems.length - i - 1;
		if(n + 1 == papernumber){
			DBThumbnailListItems[i].className = 'selected';
		}else{
			DBThumbnailListItems[i].className = '';
		}
	}
	
	hotcake.scrollTo('DBImageListView' + papernumber);
	
	return false;
}
function setupDBImageListView(){
	var DBThumbnailList = document.getElementById('DBThumbnailList');
	var DBThumbnailListUL = DBThumbnailList.getElementsByTagName('ul')[0];
	var DBThumbnailListULLis = DBThumbnailListUL.getElementsByTagName('li');
	var newHTML = '';
	for(var i = DBThumbnailListULLis.length - 1; 0 <= i; i--){
		newHTML += DBThumbnailListULLis[i].outerHTML;
	}
	DBThumbnailListUL.innerHTML = newHTML;
	DBThumbnailList.scrollLeft = 9999;
	hotcake.addEventLoad(function(){
		DBThumbnailList.scrollLeft = 9999;
	});
	DBImageListViewShowImage(1);
	// if(!document.getElementById('DBImageListView2')){
	// 	document.getElementById('DBThumbnailList').style.display = 'none';
	// }
}
// JavaScript Document