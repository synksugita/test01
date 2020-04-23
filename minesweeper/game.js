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
	block_opend: 10,
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

ModeChanger.prototype.setTexture = function(mode){
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

Block.prototype.setTexture = function(kind){
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
				texture = this.$.resources.images.block_opend;
				break;
			}
		case BlockKind.block_closed:{
				texture = this.$.resourcees.images.block_closed;
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
	var nBlock = this.sizeX * this.sizeY;
	for(var i = 0; i < nBlock; i++){
		var block = this.blockArray[i];
		block.isOpen = false;
		block.isMine = false;
		block.isFlag = false;
		block.number = 0;
	}
}

Board.prototype.putMines = function(nMine){
	//爆弾無し
	if(nMine <= 0){return}

	this.nMine = nMine;

	//全部爆弾
	var nBlock = this.sizeX * this.sizeY;
	if(nMine >= nBlock){
		for(var i = 0; i < nBlock; i++){
			this.blockArray[i].isMine = true;
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
		//var num = numList[parseInt(Math.random() * numList.length)];
		var block = this.blockArray[num];
		var x = block.posX;
		var y = block.posY;
console.log(num);
		if(block.isMine == false){
			block.isMine = true;
			//numList.splice(num, 1);
			//incliment around block`s number
			for(var i = -1; i <= 1; i++){
				for(var j = -1; j <= 1; j++){
					if(i == 0 && j == 0){continue;}//me
					block = this.getBlock(x+j, y+i);
					if(block === undefined){continue;}
					block.number++;
				}
			}
		}
	}
console.log(numList);
}

Board.prototype.openBlock = function(objBlock){
	if(this.touchMode == false){
		return this.setFlag(objBlock);
	}

	if(objBlock.isOpen == true || objBlock.isFlag == true){return;}
	objBlock.isOpen = true;
	if(objBlock.isMine == true){
		objBlock.setTexture(BlockKind.block_mine);
		this.emit('mine');
		return;
	}
	objBlock.setTexture(objBlock.number);

	//０番処理
	if(objBlock.number == 0){
		//周囲も開ける
		for(var y = -1; y <= 1; y++){
			for(var x = -1; x <= 1; x++){
				if(x == 0 && y == 0){continue;}//me
				var block = this.getBlock(objBlock.posX + x, objBlock.posY + y);
				if(block === undefined){continue;}
				this.openBlock(block);
			}
		}
	}
	this.emit('result', this.getResult());
}

Board.prototype.setFlag = function(objBlock){
	if(objBlock.isFlag == true){
		objBlock.isFlag = false;
		objBlock.setTexture(BlockKind.block_closed);
	}
	else{
		objBlock.isFlag = true;
		objBlock.setTexture(BlockKind.block_flag);
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

	for(var y = 0; y < this.sizeY; y++){
		for(var x = 0; x < this.sizeX; x++){
			//ブロック生成
			var block = this.blockContainer.addChild(new Block(this.$, x, y));
			var self = this;
			block.on('open', function(block){
				self.openBlock(block);
			});
			this.blockArray.push(block);
		}
	}

}

Board.prototype.release = function(){
	this.blockContainer.removeChildren();
	this.blockArray = [];
}

Board.prototype.getResult = function(){
	var count = 0;
	for(var i = 0; i < this.blockArray.length; i++){
		var block = this.blockArray[i];
		if(block.isOpen == true){
			if(block.isMine == true){return -1;}//爆弾発見
			else{count++;}//爆弾ではない
		}
	}
	if((this.nMine + count) == this.blockArray.length){
		return 1;//クリア
	}
	return 0;
}

Board.prototype.end = function(){
	//this.removeChildren();

	for(var i = 0; i < this.blockArray.length; i++){
		var block = this.blockArray[i];
		block.interactive = false;
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
	this.modeChanger.setTexture(this.touchMode);
	this.emit('changeMode', this.touchMode);
}

Board.prototype.getBlock = function(X,Y){
	if(X < 0 || X >= this.sizeX || Y < 0 || Y >= this.sizeY){
		return undefined;
	}
	else if(this.blockArray.length <= 0){
		return undefined;
	}
	else{
		return this.blockArray[this.sizeX * Y + X];
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
	this.header.viewMode(this.board.touchMode);

	this.task.on('anim',function(e){this.gameloop(e)});
}

Root.prototype = Object.create(Pixim.Container.prototype);

Root.prototype.gameloop = function(e){
	if(this.isActive){
		this.bufTime += e.delta;
		if(this.bufTime >= 60){
			this.nowTime += 1;
			this.bufTime -= 60;
		}

		this.header.updateTime(this.nowTime);

		//if(this.board.getResult() != 0){
		//	this.isActive = false;
		//}
	}
	else{
		//ゲーム終了
		this.board.end();

		//var result = this.board.getResult();

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