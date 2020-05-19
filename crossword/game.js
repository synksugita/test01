

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

	this.x = X * width;
	this.y = Y * width;

	this.posX = X;
	this.posY = Y;

	//背景
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
	this.containerInputBox = this.addChild(new Pixim.Container());//入力フォーム保持用

	this.cellContainer = this.addChild(new Pixim.Container());
	this.cellArray = new Array();

	this.nCell = 0;//入力できるセルの数
	this.nAnswered = 0;//入力数
	this.correctAnswer = 0;//正答数

	this.hintCellArray = new Array();
	this.selectNum = 0;
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
				self.tapCell(cell);
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
//キーボード作成
Board.prototype.createInputBox = function(cell){
	var self = this;
	var answer = this.blueprint.answer;
	this.containerInputBox.removeChildren();
	var inputBox = this.containerInputBox.addChild(new InputBox(cell, 0, self.sizeY * 0.05 + self.sizeY));
	inputBox.on('input', function(char, charOld){
		if(char == charOld) return;
		if(charOld == ''){
			//入力された
			self.nAnswered++;
		}
		if(char == answer[cell.posY][cell.posX]){
			//正解になった
			self.correctAnswer++;
		}
		else if(charOld == answer[cell.posY][cell.posX]){
			//間違いになった
			self.correctAnswer--;
		}
		self.checkAnswer();
	});
	inputBox.on('delete', function(charOld){
		if(charOld != ''){
			//入力が取り消された
			self.nAnswered--;
		}
	});
	inputBox.on('close', function(){
		self.containerInputBox.removeChildren();
		self.bufCell.setTexture(self.$.resources.images.back1);
		self.bufCell = undefined;
		if(self.hintCellArray.length > 0){
			for(var i = self.hintCellArray.length; i > 0; i--){
				var cell = self.hintCellArray.shift();
				cell.setTexture(self.$.resources.images.back1);
			}
		}
	});

	return inputBox;
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
//全てのセルが正しいかをチェックする
Board.prototype.checkAnswer = function(){
	//回答数が満たない
	if(this.nCell > this.nAnswered) return;
/*
	//正答数が満たない
	if(this.nCell > this.correctAnswer){
		this.emit('error');
		return;
	}
*/
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
//終了処理
Board.prototype.end = function(){
	this.interactiveChildren = false;
	this.containerInputBox.removeChildren();
}
//セルを選択したとき
Board.prototype.selectCell = function(cell){
	if(this.bufCell != cell){
		//別のセルを選択した
		if(this.bufCell !== undefined){
			this.bufCell.setTexture(this.$.resources.images.back1);
		}
		this.bufCell = cell;
	}
	if(this.hintCellArray.length > 0){
		this.selectNum = 0;
		for(var i = 0; i < this.hintCellArray.length; i++){
			this.hintCellArray[i].setTexture(this.$.resources.images.back3);
		}
	}

	//選択箇所の表示
	cell.setTexture(this.$.resources.images.back2);

	//キーボード作成
	var inputBox;
	this.containerInputBox.removeChildren();
	inputBox = this.createInputBox(cell);

	return inputBox;
}
//セルをタップで選択したとき
Board.prototype.tapCell = function(cell){
	if(this.hintCellArray.length > 0){
		for(var i = this.hintCellArray.length; i > 0; i--){
			var buf = this.hintCellArray.shift();
			buf.setTexture(this.$.resources.images.back1);
		}
	}
	this.selectCell(cell);
}
//カギをタップしたとき
Board.prototype.selectHintCell = function(hint, axis){
	//axis = parseInt(axis);

	var self = this;

	var x = hint.x - 1;
	var y = hint.y - 1;
	var images = this.$.resources.images;

	//全要素削除
	if(this.hintCellArray.length > 0){
		for(var i = this.hintCellArray.length; i > 0; i--){
			var cell = this.hintCellArray.shift();
			cell.setTexture(images.back1);
		}
	}

	//ヌル文字に当たるか端に出るまで処理する
	if(axis == 0){
		//X軸方向
		for(var i = x; (i < this.cellArray[y].length); i++){
			if(this.cellArray[y][i].isActive == false) break;
			var cell = this.cellArray[y][i];
			cell.setTexture(images.back3);
			this.hintCellArray.push(cell);
		}
	}
	else{
		//Y軸方向
		for(var i = y; (i < this.cellArray.length); i++){
			if(this.cellArray[i][x].isActive == false) break;
			var cell = this.cellArray[i][x];
			cell.setTexture(images.back3);
			this.hintCellArray.push(cell);
		}
	}

	//先頭を選択状態にする
	var cell = this.hintCellArray[0];
	//矢印キーを使えるようにする
	var inputBox = this.selectCell(cell);
	if(axis == 0){
		inputBox.on('left', function(){
			cell.setTexture(images.back3);
			self.selectNum = ((self.selectNum - 1) + self.hintCellArray.length) % self.hintCellArray.length;
			cell = self.hintCellArray[self.selectNum];
			cell.setTexture(images.back2);
			inputBox.setCell(cell);
		});
		inputBox.on('right', function(){
			cell.setTexture(images.back3);
			self.selectNum = ((self.selectNum + 1) + self.hintCellArray.length) % self.hintCellArray.length;
			cell = self.hintCellArray[self.selectNum];
			cell.setTexture(images.back2);
			inputBox.setCell(cell);
		});
	}
	else{
		inputBox.on('left', function(){
			cell.setTexture(images.back3);
			self.selectNum = ((self.selectNum - 1) + self.hintCellArray.length) % self.hintCellArray.length;
			cell = self.hintCellArray[self.selectNum];
			cell.setTexture(images.back2);
			inputBox.setCell(cell);
		});
		inputBox.on('right', function(){
			cell.setTexture(images.back3);
			self.selectNum = ((self.selectNum + 1) + self.hintCellArray.length) % self.hintCellArray.length;
			cell = self.hintCellArray[self.selectNum];
			cell.setTexture(images.back2);
			inputBox.setCell(cell);
		});
	}
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

	this.cell = cell;

	for(var i = 0; i < CharSet.length; i++){
		var button = this.addChild(new Button((25+1)*i + posX, posY, CharSet[i][0], CharSet[i]));
		button.on('down', function(objButton){
			//違うボタンを押したか
			if(self.bufButton != objButton){
				self.bufButton = objButton;//押されたボタンを記録
				objButton.charnum = 0;//文字０番目をセット
			}
			var char = objButton.charset[objButton.charnum % objButton.charset.length];
			var charOld = self.cell.text.text;
			self.cell.setText(char);
			objButton.charnum++;
			self.emit('input', char, charOld);
		});
	}
	//削除ボタン
	var button = this.addChild(new Button(posX, posY + 50, '×'));
	button.on('down', function(){
		var charOld = self.cell.text.text;
		self.cell.setText('');
		if(self.bufButton !== undefined){
			self.bufButton.charnum = 0;
		}
		self.emit('delete', charOld);
	});
	//閉じるボタン
	var button = this.addChild(new Button(posX + 100, posY + 50, '閉'));
	button.on('down', function(){
		self.emit('close');
	});

	//←ボタン
	var button = this.addChild(new Button(posX + 200, posY + 50, '←'));
	button.on('down', function(){
		self.emit('left');
	});
	//→ボタン
	var button = this.addChild(new Button(posX + 250, posY + 50, '→'));
	button.on('down', function(){
		self.emit('right');
	});

}

InputBox.prototype = Object.create(Pixim.Container.prototype);

InputBox.prototype.setCell = function(cell){
	this.cell = cell;
	if(this.bufButton != undefined){
		this.bufButton.charnum = 0;
	}
}


var HintBox = function($, key, hint, X, Y, width, height){
	Pixim.Container.call(this);

	var self = this;

	this.$ = $
	this.hint = hint;
	this.x = X;
	this.y = Y;

	var fontsize = height / hint.length * 0.8;

	//背景
	this.sprite = this.addChild(new PIXI.Sprite(this.$.resources.images.back1));
	this.sprite.x = 0;
	this.sprite.y = 0;
	this.sprite.width = width;
	this.sprite.height = height;

	//文字
	var style = {
		fontSize: fontsize,
		fill: 0xffffff,
	}
	var textPosX = width * 0.05;
	var textPosY = height * 0.05;
	this.textContainer = this.addChild(new Pixim.Container());

	//種類
	var textName = this.textContainer.addChild(new PIXI.Text(key, style));
	textName.x = textPosX;
	textName.y = textPosY;
	//カギ
	for(var i = 0; i < hint.length; i++){
		var num = hint[i].num;
		var key = hint[i].key;
		var text = this.textContainer.addChild(new PIXI.Text(num+","+key,style));
		text.x = textPosX;
		text.y = fontsize * (i + 1) + textPosY;
		text.num = i;
		text.on('pointerdown', function(){
			self.emit('down', hint[this.num]);
		});
		text.interactive = true;
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
		this.emit('down', this.num);
	});
	this.interactive = true;
}

TextButton.prototype = Object.create(Pixim.Container.prototype);


var Root = function($){
	Pixim.Container.call(this);

	this.$ = $;

	var self = this;

	this.containerIngame = this.addChild(new Pixim.Container());
	this.containerOutgame = this.addChild(new Pixim.Container());

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
	});
/*
	this.board.on('error', function(){
		self.header.viewStatus('ERROR');
	});
*/
	this.hintboxX = this.containerIngame.addChild(new HintBox($, 'ヨコのカギ', blueprint.hintX, 0, 400, 450, 200));
	this.hintboxX.on('down', function(obj){
		self.board.selectHintCell(obj, 0);
	});
	this.hintboxY = this.containerIngame.addChild(new HintBox($, 'タテのカギ', blueprint.hintY, 0, 600, 450, 200));
	this.hintboxY.on('down', function(obj){
		self.board.selectHintCell(obj, 1);
	});

	this.watch = this.containerIngame.addChild(new Watch(300,0));
	this.watch.on('update', function(time){
		self.header.viewTime(time);
	});
	this.watch.start();

	//選択画面に戻るボタン
	var button = this.containerIngame.addChild(new Button(this.$.width-50, 0, '戻'));
	button.on('down', function(){
		self.toOutgame();
	});
}

Root.prototype.toOutgame = function(){
	this.containerIngame.removeChildren();

	var $ = this.$;

	var self = this;
	for(var i = 0; i < CrosswordList.length; i++){
		var button = this.containerOutgame.addChild(new TextButton(CrosswordList[i], 0, i*30, i));
		button.on('down', function(num){
			//jsonから問題を読み込む
			new PIXI.Loader().add("obj", CrosswordList[num] + ".json").load(function(loader, resources){
				var data = resources.obj.data;
				self.toIngame(data);
			});
		});
	}
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
	back3: 'images/back3.png',
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
//console.log(app);


//Attach content to application and run application
app.attachAsync(new content())
	.then(function(){
		app.play();
	});