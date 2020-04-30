var FPS = 60;

//操作モードの番号
var KindTouchMode = {
	open: 0,
	flag: 1,
}

//ブロックのテクスチャ番号
var KindBlock = {
	number0: 0,
	number1: 1,
	number2: 2,
	number3: 3,
	number4: 4,
	number5: 5,
	number6: 6,
	number7: 7,
	number8: 8,
	number9: 9,
	block_opened: 10,
	block_closed: 11,
	block_mine: 12,
	block_flag: 13,
}


var Watch = function(){
	Pixim.Container.call(this);

	this.bufTime = 0;
	this.passedTime = 0;
}

Watch.prototype = Object.create(Pixim.Container.prototype);

Watch.prototype.start = function(){
	this.passedTime = 0;
	this.task.on('anim', function(e){this.loop(e);});
}

Watch.prototype.end = function(){
	this.task.clear('anim');
}

Watch.prototype.loop = function(e){
	this.passedTime += e.delta / FPS;//秒単位に直して加算
	this.emit('update', this.passedTime);
/*
	this.bufTime += e.delta;
	if(this.bufTime >= FPS){
		this.passedTime += 1;
		this.emit('update', this.getPassedTime());
		this.bufTime -= FPS;
	}
*/
}
/*
Watch.prototype.getPassedTime = function(){
	return this.passedTime;
}
*/

var Header = function($){
	Pixim.Container.call(this);

	this.$ = $;

	this.textTime = this.addChild(new PIXI.Text('TIME',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'}));
	this.textTime.x = 0;
	this.textTime.anchor.x = 0;

	this.textTouchMode = this.addChild(new PIXI.Text('MODE',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'}));
	this.textTouchMode.x = this.$.width - 200;

	this.textGameMessage = this.addChild(new PIXI.Text('MESSAGE',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'}));
	this.textGameMessage.text = '';
	this.textGameMessage.x = this.$.width/2;
	this.textGameMessage.anchor.x = 0.5;
}

Header.prototype = Object.create(Pixim.Container.prototype);

Header.prototype.updateTime = function(timeSecond){
	var time = parseInt(timeSecond);//小数点以下切り捨て
	this.textTime.text = 'TIME : ' + time;
}

Header.prototype.viewMessage = function(message){
	this.textGameMessage.text = message;
}

Header.prototype.viewMode = function(mode){
	this.textTouchMode.text = 'MODE : ' + mode;
}


var ModeChanger = function($, touchMode){
	Pixim.Container.call(this);

	this.$ = $;

	this.sprite = this.addChild(new PIXI.Sprite());
	this.sprite.width = 50;
	this.sprite.height = 50;
	this.sprite.x = $.width - this.sprite.width;
	this.sprite.y = 50;

	this.tellKind(touchMode);

	this.on('pointerdown', function(){
		this.emit('selected');
	});
	this.interactive = true;
}

ModeChanger.prototype = Object.create(Pixim.Container.prototype);

ModeChanger.prototype.tellKind = function(touchMode){
	var texture;
	switch(touchMode){
		case KindTouchMode.open:{texture = this.$.resources.images.block_opened; break;}
		case KindTouchMode.flag:{texture = this.$.resources.images.block_flag;   break;}
	}
	this.sprite.texture = texture;
}

ModeChanger.prototype.setTexture = function(texture){
	this.sprite.texture = texture;
}


var Block = function($, X, Y){
	Pixim.Container.call(this);

	this.$ = $;

	this.sprite = this.addChild(new PIXI.Sprite($.resources.images.block_closed));

	this.sprite.width = 30;
	this.sprite.height = 30;
	this.sprite.x = X * this.sprite.width;
	this.sprite.y = Y * this.sprite.height;

	this.posX = X;
	this.posY = Y;

	this.isOpen = false;
	this.isMine = false;
	this.isFlag = false;
	this.number = 0;

	this.on('pointerdown', function(){
		this.emit('selected', this);
	});
	this.interactive = true;
}

Block.prototype = Object.create(Pixim.Container.prototype);

Block.prototype.tellKind = function(kind){
	var texture;
	var keys = Object.keys(KindBlock);
	texture = this.$.resources.images[keys[kind]];
/*
	switch(kind){
		case KindBlock.number0:
		case KindBlock.number1:
		case KindBlock.number2:
		case KindBlock.number3:
		case KindBlock.number4:
		case KindBlock.number5:
		case KindBlock.number6:
		case KindBlock.number7:
		case KindBlock.number8:
		case KindBlock.number9:{
			texture = this.$.resources.images['number' + kind];
			break;
		}
		case KindBlock.block_opened:{
			texture = this.$.resources.images.block_opened;
			break;
		}
		case KindBlock.block_closed:{
			texture = this.$.resources.images.block_closed;
			break;
		}
		case KindBlock.block_mine:{
			texture = this.$.resources.images.block_mine;
			break;
		}
		case KindBlock.block_flag:{
			texture = this.$.resources.images.block_flag;
			break;
		}
	}
*/
	this.sprite.texture = texture;
}

Block.prototype.open = function(){
	//フラッグが立っているなら何もしない
	if(this.isFlag == true){
		return this.emit('openResult', this, KindBlock.block_flag);
	}
	//既に開いているなら何もしない
	if(this.isOpen == true){
		return this.emit('openResult', this, KindBlock.block_opened);
	}

	//開く
	this.isOpen = true;

	//爆弾だった
	if(this.isMine == true){
		this.tellKind(KindBlock.block_mine);
		return this.emit('openResult', this, KindBlock.block_mine);
	}
	//数字だった
	this.tellKind(this.number);
	this.emit('openResult', this, this.number);
}

Block.prototype.changeFlag = function(){
	if(this.isOpen == true){return;}

	if(this.isFlag == true){
		this.isFlag = false;
		this.tellKind(KindBlock.block_closed);
	}
	else{
		this.isFlag = true;
		this.tellKind(KindBlock.block_flag);
	}
}


var Board = function($){
	Pixim.Container.call(this);

	this.$ = $;

	this.y = 50;
	this.sizeX = 0;
	this.sizeY = 0;

	this.nMine = 0;
	this.countOpen = 0;

	this.touchMode = KindTouchMode.open;

	this.blockContainer = this.addChild(new Pixim.Container());
	this.blockArray = new Array();

	this.modeChanger = this.addChild(new ModeChanger(this.$, this.touchMode));
	var self = this;
	this.modeChanger.on('selected', function(){
		self.changeMode();
	});
}

Board.prototype = Object.create(Pixim.Container.prototype);

Board.prototype.initialize = function(nMine){
	//if(this.sizeX <= 0 && this.sizeY <= 0){return;}
	if(this.blockArray.length <= 0){return;}

	this.countOpen = 0;
	this.clearBlocks();
	this.putMines(nMine);
}

Board.prototype.clearBlocks = function(){
	for(var y = 0; y < this.sizeY; y++){
		for(var x = 0; x < this.sizeX; x++){
			var block = this.blockArray[y][x];
			block.isOpen = false;
			block.isMine = false;
			block.isFlag = false;
			block.number = 0;
		}
	}
}

Board.prototype.putMines = function(nMine){
	this.nMine = nMine;

	//爆弾無し
	if(nMine <= 0){return}

	//全部爆弾
	var nBlock = this.sizeX * this.sizeY;
	if(nMine >= nBlock){
		for(var y = 0; y < this.sizeY; y++){
			for(var x = 0; x < this.sizeX; x++){
				this.blockArray[y][x].isMine = true;
			}
		}
		return;
	}

	//ランダムな位置に爆弾生成
	var numList = new Array();
	for(var i = 0; i < nBlock; i++){
		numList.push(i);
	}
	for(var n = 0; n < nMine; n++){
		var num = numList.splice(parseInt(Math.random() * numList.length), 1);
		var y = parseInt(num / this.sizeY);
		var x = parseInt(num % this.sizeY);
		var block = this.blockArray[y][x];
		if(block.isMine == false){
			block.isMine = true;
			//incliment around block`s number
			for(var i = -1; i <= 1; i++){
				for(var j = -1; j <= 1; j++){
					if(i == 0 && j == 0){continue;}//me
					//var block = this.blockArray[y+i][x+j];
					var block = this.getBlock(x+j,y+i);
					if(block === undefined){continue;}
					block.number++;
				}
			}
		}
	}
}

Board.prototype.selectBlock = function(objBlock){
	//フラッグモードの操作
	if(this.touchMode == KindTouchMode.flag){
		objBlock.changeFlag();
		return;
	}

	//開く
	//this.openBlock(objBlock);
	objBlock.open();
}

Board.prototype.openResult = function(objBlock, kind){
	//何もしない
	if(kind == KindBlock.block_opened){
		return;
	}
	if(kind == KindBlock.block_flag){
		return;
	}

	//開いた
	this.countOpen++;

	//爆弾
	if(kind == KindBlock.block_mine){
		this.emit('gameOver');
		return;
	}

	//０番
	if(kind == KindBlock.number0){
		this.openZero(objBlock);
	}

	//クリアチェック
	var nBlock = this.sizeX * this.sizeY;
	if(this.countOpen == (nBlock - this.nMine)){
		this.emit('gameClear');
		return;
	}
}

Board.prototype.openZero = function(objBlock){
	for(var y = -1; y <= 1; y++){
		for(var x = -1; x <= 1; x++){
			if(x == 0 && y == 0){continue;}
			var block = this.getBlock(objBlock.posX + x, objBlock.posY + y);
			if(block === undefined){continue;}
			block.open();
		}
	}
}

Board.prototype.create = function(X,Y){
	X = parseInt(X);
	Y = parseInt(Y);
	if(X < 0 || Y < 0){return;}

	this.sizeX = X;
	this.sizeY = Y;

	//生成済みなら消す
	if(this.blockArray.length > 0){
		this.release();
	}

	//二次元配列でまとめる
	for(var y = 0; y < this.sizeY; y++){
		this.blockArray.push(new Array());
	}
	for(var y = 0; y < this.sizeY; y++){
		for(var x = 0; x < this.sizeX; x++){
			//ブロック生成
			var block = this.blockContainer.addChild(new Block(this.$, x, y));
			var self = this;
			block.on('selected', function(block){
				self.selectBlock(block);
			});
			block.on('openResult', function(block, kind){
				self.openResult(block,kind);
			});
			this.blockArray[y].push(block);
		}
	}
}

Board.prototype.release = function(){
	this.blockContainer.removeChildren();
	this.blockArray = [];
}
/*
Board.prototype.getResult = function(){
	var count = 0;
	for(var y = 0; y < this.sizeY; y++){
		for(var x = 0; x < this.sizeX; x++){
			var block = this.blockArray[y][x];
			if(block.isOpen == true){
				if(block.isMine == true){return -1;}//爆弾発見
				else{count++};//爆弾ではない
			}
		}
	}
	if((this.nMine + count) == (this.sizeX * this.sizeY)){
		return 1;//クリア
	}
	return 0;
}
*/
Board.prototype.end = function(){
	//this.removeChildren();

	this.interactiveChildren = false;
/*
	for(var y = 0; y < this.sizeY; y++){
		for(var x = 0; x < this.sizeX; x++){
			var block = this.blockArray[y][x];
			block.interactive = false;
		}
	}
	this.modeChanger.interactive = false;
*/
}

Board.prototype.changeMode = function(){
	//操作モードチェンジ
	var keys = Object.keys(KindTouchMode);
	this.touchMode = (this.touchMode + 1) % keys.length;

	//テクスチャ指定
	var texture;
	switch(this.touchMode){
		case KindTouchMode.open:{
			texture = this.$.resources.images.block_opened;
			break;
		}
		case KindTouchMode.flag:{
			texture = this.$.resources.images.block_flag;
			break;
		}
	}
	this.modeChanger.setTexture(texture);
/*
	this.modeChanger.tellKind(this.touchMode);
*/
	//文字表示切替
	this.emit('changeMode', this.touchMode);
}

Board.prototype.getTouchMode = function(){
	return this.touchMode;
}

Board.prototype.getBlock = function(X,Y){
	X = parseInt(X);
	Y = parseInt(Y);
	if(X < 0 || X >= this.sizeX || Y < 0 || Y >= this.sizeY){
		return undefined;
	}
	else{
		return this.blockArray[Y][X];
	}
}

var Root = function($){
	Pixim.Container.call(this);

	var self = this;

	this.watch = this.addChild(new $.lib.watch());
	this.watch.on('update', function(passedTime){
		self.header.updateTime(passedTime);
	});

	this.header = this.addChild(new $.lib.header($));

	this.board = this.addChild(new $.lib.board($));
	this.board.on('changeMode', function(mode){
		var message;
		var keys = Object.keys(KindTouchMode);
		message = keys[mode].toUpperCase();
/*
		switch(mode){
			case KindTouchMode.open:{
				message = 'OPEN';
				break;
			}
			case KindTouchMode.flag:{
				message = 'FLAG';
				break;
			}
		}
*/
		self.header.viewMode(message);
	});
	this.board.on('gameClear', function(){
		self.resultGameClear();
	});
	this.board.on('gameOver', function(){
		self.resultGameOver();
	});
	this.board.create(10,10);
	this.board.initialize(10);

	this.watch.start();
	this.header.updateTime(this.watch.passedTime);
	this.header.viewMode('OPEN');
}

Root.prototype = Object.create(Pixim.Container.prototype);

Root.prototype.end = function(message){
	this.watch.end();
	this.board.end();
	this.header.updateTime(this.watch.passedTime);
	this.header.viewMessage(message);
}

Root.prototype.resultGameClear = function(){
	this.end('GAME CLEAR');
}

Root.prototype.resultGameOver = function(){
	this.end('GAME OVER');
}


//Create content
//Pixim.Content.create('testgame');
//var content = Pixim.Content.get('testgame');
var content = Pixim.Content.create();

content.setConfig({
	width: 600,
	height: 600,
});

content.defineImages({
	number0: 'numbers/0.png',
	number1: 'numbers/1.png',
	number2: 'numbers/2.png',
	number3: 'numbers/3.png',
	number4: 'numbers/4.png',
	number5: 'numbers/5.png',
	number6: 'numbers/6.png',
	number7: 'numbers/7.png',
	number8: 'numbers/8.png',
	number9: 'numbers/9.png',
	block_opened: 'blocks/block_opened.png',
	block_closed: 'blocks/block_closed.png',
	block_mine: 'blocks/block_mine.png',
	block_flag: 'blocks/block_flag.png',
});

content.defineLibraries({
	root: Root,
	header: Header,
	board: Board,
	watch: Watch,
});


//Create application
var app = new Pixim.Application({
	width: content._piximData.config.width,
	height: content._piximData.config.height
});


//Attach content to application and run application
app.attachAsync(new content())
	.then(function(){
		app.play();
	});