//var FPS = 60;
/*
var CharSet = [
	['ア','イ','ウ','エ','オ'],
	['カ','キ','ク','ケ','コ'],
	['サ','シ','ス','セ','ソ'],
	['タ','チ','ツ','テ','ト'],
	['ナ','ニ','ヌ','ネ','ノ'],
	['ハ','ヒ','フ','ヘ','ホ'],
	['マ','ミ','ム','メ','モ'],
	['ヤ','ユ','ヨ'],
	['ラ','リ','ル','レ','ロ'],
	['ワ','ヲ','ン'],
	['ガ','ギ','グ','ゲ','ゴ'],
	['ザ','ジ','ズ','ゼ','ゾ'],
	['ダ','ヂ','ヅ','デ','ド'],
	['バ','ビ','ブ','ベ','ボ'],
	['パ','ピ','プ','ペ','ポ'],
];
*/
/*
var Hint = function(num, x, y, key){
	this.num = num;
	this.x = x;
	this.y = y;
	this.key = key;
}
*/
/*
var Blueprint = function(){
	this.answer = [
		['ミ','ツ','','シ','ラ','ハ'],
		['ア','ゲ','ダ','マ','','ネ'],
		['イ','','ル','イ','ジ',''],
		['','ア','マ','','カ','コ'],
		['ツ','タ','','ア','ン','コ'],
		['ナ','マ','ゴ','ミ','','ア'],
	];

	this.hintX = new Array();
	this.hintX.push(new Hint(1, 1, 1, "花の○○を吸う"));
	this.hintX.push(new Hint(3, 4, 1, "真剣○○○取り"));
	this.hintX.push(new Hint(5, 1, 2, "「タヌキうどん」に入っているもの"));
	this.hintX.push(new Hint(7, 3, 3, "人気商品の○○○品が出回る"));
	this.hintX.push(new Hint(9, 2, 4, "海に潜って魚介類を採る仕事"));
	this.hintX.push(new Hint(10, 5, 4, "○○→現在→未来"));
	this.hintX.push(new Hint(12, 1, 5, "壁を這う植物"));
	this.hintX.push(new Hint(13, 4, 5, "タイヤキに詰まっているもの"));
	this.hintX.push(new Hint(14, 1, 6, "料理をすると出る不要なもの"));
	this.hintX.name = 'ヨコのカギ';

	this.hintY = new Array();
	this.hintY.push(new Hint(1, 1, 1, "「恋愛」でなくコレで結婚"));
	this.hintY.push(new Hint(2, 2, 1, "「柘植」と書くハンコの材料になる木"));
	this.hintY.push(new Hint(3, 4, 1, "⇔兄弟"));
	this.hintY.push(new Hint(4, 6, 1, "蝶はコレを使って舞います"));
	this.hintY.push(new Hint(6, 3, 2, "願いが叶ったら目を描く縁起物"));
	this.hintY.push(new Hint(8, 5, 3, "サナギから脱皮するのに○○○が掛かる"));
	this.hintY.push(new Hint(9, 2, 4, "触覚がある部分"));
	this.hintY.push(new Hint(11, 6, 4, "「ホットチョコレート」とも呼ぶ飲み物"));
	this.hintY.push(new Hint(12, 1, 5, "運動会で引っ張り合うもの"));
	this.hintY.push(new Hint(13, 4, 5, "蝶を捕る道具"));
	this.hintY.name = 'タテのカギ';
}
*/

var Cell = function(isActive, X, Y, width, height){
	Pixim.Container.call(this);

	this.isActive = isActive;
	var backcolor;
	if(this.isActive == true){
		backcolor = 0x808080;
		this.interactive = true;
	}
	else{
		backcolor = 0xffffff;
		this.interactive = false;
	}

	this.on('pointerdown', function(){
		this.emit('down', this);
	});
	this.on('pointerup', function(){
		this.emit('up', this);
	});
/*
	var width = 35;
	var height = 35;
*/
	this.x = X * width;
	this.y = Y * width;

	this.posX = X;
	this.posY = Y;

	//背景
/*
	this.graphics = this.addChild(new PIXI.Graphics());
	this.graphics.beginFill(backcolor);
	this.graphics.drawRect(0,0,width,height);
	this.graphics.endFill();
*/
	this.sprite = this.addChild(new PIXI.Sprite());
	this.sprite.x = 0;
	this.sprite.y = 0;
	this.sprite.width = width;
	this.sprite.height = height;

	//文字
	var small = (width < height) ? width : height;
	fontsize = small * 0.5;//サイズ調整
	var style = {
		fontSize: fontsize,
		fill: 0xffffff,
	}
	this.text = this.addChild(new PIXI.Text('',style));
	//表示位置を中央に
	this.text.anchor.x = 0.5;
	this.text.anchor.y = 0.5;
	this.text.x = (width - 0) / 2;
	this.text.y = (height - 0) / 2;

	//小さい数字
	fontsize = small * 0.25;//サイズ調整
	var style = {
		fontSize: fontsize,
		fill: 0xffffff,
	}
	this.textNum = this.addChild(new PIXI.Text('',style));
	this.textNum.x = 1;
	this.textNum.y = 1;
}

Cell.prototype = Object.create(Pixim.Container.prototype);

Cell.prototype.setText = function(text){
	this.text.text = text;
}
//左上の小さい数字
Cell.prototype.setTextNum = function(num){
	this.textNum.text = num;
}

Cell.prototype.setTexture = function(texture){
	this.sprite.texture = texture;
}


/*クロスワードの設計図を基に作られる*/
var Board = function($, blueprint, posX, posY, sizeX, sizeY){
	Pixim.Container.call(this);

	this.$ = $;
	this.blueprint = blueprint;
	this.x = posX;
	this.y = posY;
	this.sizeX = sizeX;
	this.sizeY = sizeY;

	this.bufCell;//選択されたセル記録用
	this.inputBox = this.addChild(new Pixim.Container());//入力フォーム保持用

	this.cellContainer = this.addChild(new Pixim.Container());
	this.cellArray = new Array();

	this.nCell = 0;//入力できるセルの数
	this.nAnswered = 0;//入力数
	this.correctAnswer = 0;//正答数
}

Board.prototype = Object.create(Pixim.Container.prototype);

Board.prototype.create = function(){
	var self = this;

	var answer = this.blueprint.answer;

	//セルの大きさを決める
	var cellWidth = this.sizeX / answer[0].length;
	var cellHeight = this.sizeY / answer.length;

	//二次元配列で作る
	for(var y = 0; y < answer.length; y++){
		this.cellArray.push(new Array());
	}
	//セルを作る
	for(var y = 0; y < answer.length; y++){
		for(var x = 0; x < answer[y].length; x++){
			var texture;
			var isActive;
			if(answer[y][x] != ''){
				isActive = true;
				texture = this.$.resources.images.back1;
				this.nCell++;
			}
			else{
				isActive = false;
				texture = this.$.resources.images.back0;
			}
			var cell = new Cell(isActive, x, y, cellWidth, cellHeight);
			cell.setTexture(texture);
			cell.on('down', function(cell){
				if(self.bufCell != cell){
					//別のセルを選択した
					if(self.bufCell !== undefined){
						self.bufCell.setTexture(self.$.resources.images.back1);
					}
					cell.setTexture(self.$.resources.images.back2);
					self.bufCell = cell;
					self.inputBox.removeChildren();
					var inputBox = self.inputBox.addChild(new InputBox(cell, 0, self.sizeY * 0.05 + self.sizeY));
					inputBox.on('input', function(char, charOld){
						if(char == charOld) return;
						if(charOld == ''){
							//入力された
							self.nAnswered++;
						}
						if(char == answer[cell.posY][cell.posX]){
							//正解になった
							self.correctAnswer++;
							self.checkAnswer();
						}
						else if(charOld == answer[cell.posY][cell.posX]){
							//間違いになった
							self.correctAnswer--;
						}
					});
					inputBox.on('delete', function(charOld){
						if(charOld != ''){
							//入力が取り消された
							self.nAnswered--;
						}
					});
					inputBox.on('close', function(){
						self.inputBox.removeChildren();
						self.bufCell.setTexture(self.$.resources.images.back1);
						self.bufCell = undefined;
					});
				}
			});
			//cell.setText(answer[y][x]);

			this.cellContainer.addChild(cell);
			this.cellArray[y].push(cell);
		}
	}

	//小さい数字を入れる
	this.setHintNumber(this.blueprint.hintX);//横
	this.setHintNumber(this.blueprint.hintY);//縦
}
//小さい数字を入れる
Board.prototype.setHintNumber = function(hint){
	for(var i = 0; i < hint.length; i++){
		var num = hint[i].num;
		var x = hint[i].x - 1;
		var y = hint[i].y - 1;
		var cell = this.cellArray[y][x];
		cell.setTextNum(num);
	}
}

Board.prototype.checkAnswer = function(){
	//回答数が満たない
	if(this.nCell > this.nAnswered) return;

	//正答数が満たない
	if(this.nCell > this.correctAnswer){
		this.emit('error');
		return;
	}
/*
	var answer = this.blueprint.answer;
	for(var y = 0; y < answer.length; y++){
		for(var x = 0; x < answer[y].length; x++){
			if(this.cellArray[y][x].text.text != answer[y][x]){
				//間違いあり
				this.emit('error');
				return;
			}
		}
	}
*/
	//クリア
	this.emit('clear');
}

Board.prototype.end = function(){
	this.interactiveChildren = false;
	this.inputBox.removeChildren();
}


var Button = function(X, Y, char, charset){
	Pixim.Container.call(this);

	this.x = X;
	this.y = Y;

	this.charset = charset;
	this.charnum = 0;

	var width = 25;
	var height = 25;

	this.graphics = this.addChild(new PIXI.Graphics());
	this.graphics.beginFill(0x808080);
	this.graphics.drawRect(0,0,width,height);
	this.graphics.endFill();

	var style = {
		fontSize: 20,
		fill: 0xffffff,
	}
	this.text = this.addChild(new PIXI.Text(char, style));
	this.text.anchor.x = 0.5;
	this.text.anchor.y = 0.5;
	this.text.x = (width - 0) / 2;
	this.text.y = (height - 0) / 2;

	this.on('pointerdown', function(){
		this.emit('down', this);
	});
	this.on('pointerup', function(){
		this.emit('up', this);
	});
	this.interactive = true;
}

Button.prototype = Object.create(Pixim.Container.prototype);


//指定されたセルに対する入力
var InputBox = function(cell, posX, posY){
	Pixim.Container.call(this);

	this.bufButton;//押されたボタン記録用

	var self = this;

	for(var i = 0; i < CharSet.length; i++){
		var button = this.addChild(new Button((25+1)*i + posX, posY, CharSet[i][0], CharSet[i]));
		button.on('down', function(objButton){
			//違うボタンを押したか
			if(self.bufButton != objButton){
				self.bufButton = objButton;//押されたボタンを記録
				objButton.charnum = 0;//文字０番目をセット
			}
			var char = objButton.charset[objButton.charnum % objButton.charset.length];
			var charOld = cell.text.text;
			cell.setText(char);
			objButton.charnum++;
			self.emit('input', char, charOld);
		});
	}
	//削除ボタン
	var button = this.addChild(new Button(posX, posY + 50,'×'));
	button.on('down', function(){
		var charOld = cell.text.text;
		cell.setText('');
		if(self.bufButton !== undefined){
			self.bufButton.charnum = 0;
		}
		self.emit('delete', charOld);
	});
	//閉じるボタン
	var button = this.addChild(new Button(posX + 100, posY + 50,'閉'));
	button.on('down', function(){
		self.emit('close');
	});
}

InputBox.prototype = Object.create(Pixim.Container.prototype);


var HintBox = function($, hint, X, Y, width, height){
	Pixim.Container.call(this);

	this.$ = $
	this.hint = hint;
	this.x = X;
	this.y = Y;

	var fontsize = height / hint.length * 0.8;
/*
	var width = 400;
	var height = (hint.length + 1) * fontsize;
*/
/*
	this.graphics = this.addChild(new PIXI.Graphics());
	this.graphics.beginFill(0x808080);
	this.graphics.drawRect(0,0,width,height);
	this.graphics.endFill();
*/
	this.sprite = this.addChild(new PIXI.Sprite(this.$.resources.images.back1));
	this.sprite.x = 0;
	this.sprite.y = 0;
	this.sprite.width = width;
	this.sprite.height = height;

	var style = {
		fontSize: fontsize,
		fill: 0xffffff,
	}
	var textPosX = width * 0.05;
	var textPosY = height * 0.05;
	this.textContainer = this.addChild(new Pixim.Container());
	var textName = this.textContainer.addChild(new PIXI.Text(hint.name, style));
	textName.x = textPosX;
	textName.y = textPosY;
	for(var i = 0; i < hint.length; i++){
		var num = hint[i].num;
		var key = hint[i].key;
		var text = this.textContainer.addChild(new PIXI.Text(num+","+key,style));
		text.x = textPosX;
		text.y = fontsize * (i + 1) + textPosY;
	}
}

HintBox.prototype = Object.create(Pixim.Container.prototype);


var Header = function(){
	Pixim.Container.call(this);

	var fontsize = 20;

	var style = {
		fontSize: fontsize,
		fill: 0xffffff,
	}
	this.textTime = this.addChild(new PIXI.Text('0',style));
	this.textTime.x = 250;
	this.textTime.y = 0;

	this.textStatus = this.addChild(new PIXI.Text('',style));
	this.textStatus.x = 250;
	this.textStatus.y = 30;
}

Header.prototype = Object.create(Pixim.Container.prototype);

Header.prototype.viewTime = function(time){
	time = parseInt(time);
	this.textTime.text = 'TIME : ' + time;
}

Header.prototype.viewStatus = function(status){
	this.textStatus.text = 'STATUS : ' + status;
}


var Watch = function(X, Y){
	Pixim.Container.call(this);

	this.bufTime = 0;
}

Watch.prototype = Object.create(Pixim.Container.prototype);

Watch.prototype.start = function(){
	this.bufTime = 0;
	this.task.on('anim', function(e){
		this.loop(e);
	});
}

Watch.prototype.end = function(){
	this.task.clear('anim');
}

Watch.prototype.viewTime = function(time){
	time = parseInt(time);
	this.textTime.text = 'TIME : ' + time;
}

Watch.prototype.loop = function(e){
	this.bufTime += e.delta / FPS;
	this.emit('update', this.bufTime);
}


var TextButton = function(text, X, Y, num){
	Pixim.Container.call(this);

	this.x = X;
	this.y = Y;

	this.num = num;

	var fontsize = 20;

	//背景
	this.graphics = this.addChild(new PIXI.Graphics());
	this.graphics.beginFill(0x808080);
	this.graphics.drawRect(0, 0, fontsize * text.length, fontsize);
	this.graphics.endFill();

	//文字
	var style = {
		fontSize: fontsize,
		fill: 0xffffff,
	}
	this.text = this.addChild(new PIXI.Text(text, style));

	this.on('pointerdown', function(){
		this.emit('down', this);
	});
	this.interactive = true;
}

TextButton.prototype = Object.create(Pixim.Container.prototype);


var Root = function($){
	Pixim.Container.call(this);

	this.$ = $;

	this.containerIngame = this.addChild(new Pixim.Container());
	this.containerOutgame = this.addChild(new Pixim.Container());
/*
	var self = this;

	var blueprint = new Blueprint2();

	this.header = this.addChild(new Header());

	this.board = this.addChild(new Board($, blueprint, 0, 0, 250, 250));
	this.board.create();
	this.board.on('clear', function(){
		self.header.viewStatus('CLEAR');
		self.end();
	});
	this.board.on('error', function(){
		self.header.viewStatus('ERROR');
	});

	this.hintboxX = this.addChild(new HintBox($, blueprint.hintX, 0, 400, 450, 200));
	this.hintboxY = this.addChild(new HintBox($, blueprint.hintY, 0, 600, 450, 200));

	this.watch = this.addChild(new Watch(300,0));
	this.watch.on('update', function(time){
		self.header.viewTime(time);
	});
	this.watch.start();
*/
	this.toOutgame();
}

Root.prototype = Object.create(Pixim.Container.prototype);

Root.prototype.toIngame = function(blueprint){
	this.containerOutgame.removeChildren();

	var $ = this.$;

	var self = this;

	this.header = this.containerIngame.addChild(new Header());

	this.board = this.containerIngame.addChild(new Board($, blueprint, 0, 0, 250, 250));
	this.board.create();
	this.board.on('clear', function(){
		self.header.viewStatus('CLEAR');
		self.end();
		//選択画面に戻るボタン
		var button = self.containerIngame.addChild(new Button(self.$.width-50, 0, '戻'));
		button.on('down', function(){
			self.toOutgame();
		});
	});
	this.board.on('error', function(){
		self.header.viewStatus('ERROR');
	});

	this.hintboxX = this.containerIngame.addChild(new HintBox($, blueprint.hintX, 0, 400, 450, 200));
	this.hintboxY = this.containerIngame.addChild(new HintBox($, blueprint.hintY, 0, 600, 450, 200));

	this.watch = this.containerIngame.addChild(new Watch(300,0));
	this.watch.on('update', function(time){
		self.header.viewTime(time);
	});
	this.watch.start();
}

Root.prototype.toOutgame = function(){
	this.containerIngame.removeChildren();

	var $ = this.$;

	var self = this;

	for(var i = 0; i < CrosswordList.length; i++){
		var button = this.containerOutgame.addChild(new TextButton('CrossWord'+i, 0, i*30, i));
		button.on('down', function(button){
			self.toIngame(CrosswordList[button.num]);
		});
	}
/*
	var button = this.containerIngame.addChild(new Button($.width-50, 0));
	button.on('down', function(){
		self.toIngame(CrosswordList[1]);
	});
*/
}

Root.prototype.end = function(){
	this.watch.end();
	this.board.end();
}


//Create content
var content = Pixim.Content.create();

content.setConfig({
	width: 450,
	height: 800,
});

content.defineImages({
	back0: 'images/back0.png',
	back1: 'images/back1.png',
	back2: 'images/back2.png',
});

content.defineLibraries({
	root: Root,
});


//Create application
var app = new Pixim.Application({
	width: content._piximData.config.width,
	height: content._piximData.config.height
});

app.fullScreen();
console.log(app);


//Attach content to application and run application
app.attachAsync(new content())
	.then(function(){
		app.play();
	});