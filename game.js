var Header = function($){
	Pixim.Container.call(this);

	this.$ = $;

	this.textTime = this.addChild(new PIXI.Text('TIME',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'}));
	this.textTime.x = this.$.width/2;
	this.textTime.y = 100;
}

Header.prototype = Object.create(Pixim.Container.prototype);

Header.prototype.updateTime = function(time){
	this.textTime.text = ('TIME : ' + time);
}


var Block = function(X, Y, texture){
	Pixim.Container.call(this);

	this.sprite = this.addChild(new PIXI.Sprite(texture));

	this.sprite.width = 10;
	this.sprite.height = 10;
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


var Board = function($){
	Pixim.Container.call(this);

	this.$ = $;

	//this.blockContainer = this.addChild(new Pixim.Container());

	this.x = 100;
	this.y = 100;
	this.sizeX = 0;
	this.sizeY = 0;
}

Board.prototype = Object.create(Pixim.Container.prototype);

Board.prototype.initialize = function(nMine){
	//if(this.sizeX <= 0 && this.sizeY <= 0){return;}
	if(this.children.length <= 0){return;}

	this.clearBlocks();
	this.putMines(nMine);
}

Board.prototype.clearBlocks = function(){
	var nBlock = this.sizeX * this.sizeY;
	for(var i = 0; i < nBlock; i++){
		var block = this.children[i];
		block.isOpen = false;
		block.isMine = false;
		block.isFlag = false;
		block.number = 0;
	}
}

Board.prototype.putMines = function(nMine){
	//爆弾無し
	if(nMine <= 0){return}

	//全部爆弾
	var nBlock = this.sizeX * this.sizeY;
	if(nMine >= nBlock){
		for(var i = 0; i < nBlock; i++){
			this.children[i].isMine = true;
		}
		return;
	}
/*
	//ランダムな位置に爆弾生成
	var count = 0;
	while(count < nMine){
		var x = parseInt(Math.random() * this.sizeX);
		var y = parseInt(Math.random() * this.sizeY);
		var block = this.getBlock(x,y);
		if(block === undefined){continue};
		if(block.isMine = false){
			block.isMine = true;
			count++;
			//incliment around block`s number
			for(var i = -1; i <= 1; i++){
				for(var j = -1; j <= 1; j++){
					if(i == 0 && j == 0){continue;}//me
					block = getBlock(x+j, y+i);
					if(block === undefined){continue;}
					block.number++;
				}
			}
		}
	}
*/
}

Board.prototype.openBlock = function(objBlock){
	if(objBlock.isOpen == true || objBlock.isFlag == true){return;}
	objBlock.isOpen = true;
	if(objBlock.isMine == true){
		objBlock.sprite.texture = this.$.resources.imgaes['number' + 9];
		this.emit('mine');
		return;
	}
	objBlock.sprite.texture = this.$.resources.images['number' + objBlock.number];

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
}

Board.prototype.create = function(X,Y){
	if(X < 0 || Y < 0){return;}

	this.sizeX = X;
	this.sizeY = Y;

	//生成済みなら消す
	if(this.children.length > 0){
		this.release();
	}

	for(var y = 0; y < this.sizeY; y++){
		for(var x = 0; x < this.sizeX; x++){
			//ブロック生成
			var block = this.addChild(new Block(x, y, this.$.resources.images.block_closed));
			var self = this;
			block.on('open', function(block){
				self.openBlock(block);
			});
		}
	}

}

Board.prototype.release = function(){
	this.removeChildren();
}

Board.prototype.getBlock = function(X,Y){
	if(X < 0 || X >= this.sizeX || Y < 0 || Y >= this.sizeY){
		return undefined;
	}
	else if(this.children.length <= 0){
		return undefined;
	}
	else{
		return this.children[this.sizeX * Y + X];
	}

}


var Root = function($){
	Pixim.Container.call(this);

	this.bufTime = 0;
	this.nowTime = 0;

	this.isActive = true;//ゲーム進行フラグ

	this.header = this.addChild(new $.lib.header($));

	this.board = this.addChild(new $.lib.board($));
	var self = this;
	this.board.on('mine', function(){self.isActive = false;});
	this.board.create(10,10);
	this.board.initialize(10);

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
	}
	else{
		//ゲーム終了
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