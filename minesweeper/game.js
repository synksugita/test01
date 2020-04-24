var FPS = 60;

var Header = function($){
	Pixim.Container.call(this);

	this.$ = $;

	this.textTime = this.addChild(new PIXI.Text('TIME',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'}));
	this.textTime.x = 0;
	this.textTime.anchor.x = 0;

	this.textTouchMode = this.addChild(new PIXI.Text('MODE',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'}));
	this.textTouchMode.x = this.$.width - 200;
}

Header.prototype = Object.create(Pixim.Container.prototype);

Header.prototype.updateTime = function(time){
	this.textTime.text = 'TIME : ' + time;
}

Header.prototype.viewResult = function(time, result){
	var message;
	if(result < 0){message = 'GAME OVER';}
	else if(result > 0){message = 'GAME CLEAR';}
	this.textTime.text = 'TIME : ' + time + ', ' + message;
}

Header.prototype.viewMode = function(mode){
	var message;
	if(mode == false){message = 'FLAG';}
	else{message = 'OPEN';}

	this.textTouchMode.text = 'MODE : ' + message;
}


var BlockKind = {
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


var ModeChanger = function($){
	Pixim.Container.call(this);

	this.$ = $;

	this.sprite = this.addChild(new PIXI.Sprite($.resources.images.block_closed));
	this.sprite.width = 50;
	this.sprite.height = 50;
	this.sprite.x = $.width - this.sprite.width;
	this.sprite.y = 50;

	this.on('pointerdown', function(){
		this.emit('change');
	});
	this.interactive = true;
}

ModeChanger.prototype = Object.create(Pixim.Container.prototype);

ModeChanger.prototype.tellSituation = function(mode){
	var texture;
	if(mode == false){
		texture = this.$.resources.images.block_flag;
	}
	else{
		texture = this.$.resources.images.block_closed;
	}
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
		this.emit('open', this);
	});
	this.interactive = true;
}

Block.prototype = Object.create(Pixim.Container.prototype);

Block.prototype.tellSituation = function(kind){
	var texture;
	switch(kind){
		case BlockKind.number0:
		case BlockKind.number1:
		case BlockKind.number2:
		case BlockKind.number3:
		case BlockKind.number4:
		case BlockKind.number5:
		case BlockKind.number6:
		case BlockKind.number7:
		case BlockKind.number8:
		case BlockKind.number9:{
				texture = this.$.resources.images['number' + kind];
				break;
			}
		case BlockKind.block_opened:{
				texture = this.$.resources.images.block_opened;
				break;
			}
		case BlockKind.block_closed:{
				texture = this.$.resources.images.block_closed;
				break;
			}
		case BlockKind.block_mine:{
				texture = this.$.resources.images.block_mine;
				break;
			}
		case BlockKind.block_flag:{
				texture = this.$.resources.images.block_flag;
				break;
			}
	}
	this.sprite.texture = texture;
}


var Board = function($){
	Pixim.Container.call(this);

	this.$ = $;

	this.y = 50;
	this.sizeX = 0;
	this.sizeY = 0;

	this.nMine = 0;

	this.touchMode = true;

	this.blockContainer = this.addChild(new Pixim.Container());
	this.blockArray = new Array();

	this.modeChanger = this.addChild(new ModeChanger(this.$));
	var self = this;
	this.modeChanger.on('change', function(){
		self.changeMode();
	});
}

Board.prototype = Object.create(Pixim.Container.prototype);

Board.prototype.initialize = function(nMine){
	//if(this.sizeX <= 0 && this.sizeY <= 0){return;}
	if(this.blockArray.length <= 0){return;}

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

Board.prototype.openBlock = function(objBlock){
	//既に開いているなら操作しない
	if(objBlock.isOpen == true){return;}

	//フラッグモードの操作
	if(this.touchMode == false){
		return this.setFlag(objBlock);
	}

	//フラッグが立っているなら開かない
	if(objBlock.isFlag == true){return;}

	//開く
	objBlock.isOpen = true;

	//爆弾のとき
	if(objBlock.isMine == true){
		objBlock.tellSituation(BlockKind.block_mine);
		this.emit('mine');
		return;
	}

	//０番のとき
	if(objBlock.number == 0){
		objBlock.tellSituation(BlockKind.block_opened);
		//周囲も開ける
		for(var y = -1; y <= 1; y++){
			for(var x = -1; x <= 1; x++){
				if(x == 0 && y == 0){continue;}//me
				//var block = this.blockArray[objBlock.posY + y][objBlock.posX + x];
				var block = this.getBlock(objBlock.posX + x, objBlock.posY + y);
				if(block === undefined){continue;}
				this.openBlock(block);
			}
		}
	}
	else{
		objBlock.tellSituation(objBlock.number);
	}
		
	this.emit('result', this.getResult());
}

Board.prototype.setFlag = function(objBlock){
	if(objBlock.isFlag == true){
		objBlock.isFlag = false;
		objBlock.tellSituation(BlockKind.block_closed);
	}
	else{
		objBlock.isFlag = true;
		objBlock.tellSituation(BlockKind.block_flag);
	}
}

Board.prototype.create = function(X,Y){
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
			block.on('open', function(block){
				self.openBlock(block);
			});
			this.blockArray[y].push(block);
		}
	}
}

Board.prototype.release = function(){
	this.blockContainer.removeChildren();
	this.blockArray = [];
}

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

Board.prototype.end = function(){
	//this.removeChildren();
	for(var y = 0; y < this.sizeY; y++){
		for(var x = 0; x < this.sizeX; x++){
			var block = this.blockArray[y][x];
			block.interactive = false;
		}
	}
	this.modeChanger.interactive = false;
}

Board.prototype.changeMode = function(){
	if(this.touchMode == true){
		this.touchMode = false;
	}
	else{
		this.touchMode = true;
	}
	this.modeChanger.tellSituation(this.touchMode);
	this.emit('changeMode', this.touchMode);
}

Board.prototype.getBlock = function(X,Y){
	if(X < 0 || X >= this.sizeX || Y < 0 || Y >= this.sizeY){
		return undefined;
	}
	else{
		return this.blockArray[Y][X];
	}
}

var Root = function($){
	Pixim.Container.call(this);

	this.bufTime = 0;
	this.nowTime = 0;

	this.isActive = true;//ゲーム進行フラグ
	this.result = 0;

	this.header = this.addChild(new $.lib.header($));

	this.board = this.addChild(new $.lib.board($));
	var self = this;
	this.board.on('mine', function(){
		self.result = -1;
		self.isActive = false;
	});
	this.board.on('changeMode', function(mode){
		self.header.viewMode(mode);
	});
	this.board.on('result', function(result){
		self.result = result;
		if(self.result != 0){self.isActive = false;}
	});
	this.board.create(10,10);
	this.board.initialize(10);

	this.header.updateTime(this.nowTime);
	this.header.viewMode(this.board.touchMode);

	this.task.on('anim',function(e){this.gameloop(e)});
}

Root.prototype = Object.create(Pixim.Container.prototype);

Root.prototype.gameloop = function(e){
	this.bufTime += e.delta;

	if(this.isActive == true){
		//毎秒更新
		if(this.bufTime >= FPS){
			this.nowTime += 1;
			this.header.updateTime(this.nowTime);
			this.bufTime -= FPS;
		}
	}
	else{
		//ゲーム終了
		this.board.end();

		this.header.viewResult(this.nowTime, this.result);

		this.task.clear('anim');
	}
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