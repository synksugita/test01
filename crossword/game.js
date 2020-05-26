

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
var Board = function($, blueprint, sizeX, sizeY){
	Pixim.Container.call(this);

	this.$ = $;
	this.blueprint = blueprint;
	this.sizeX = sizeX;
	this.sizeY = sizeY;

	var x = blueprint.answer[0].length;
	var y = blueprint.answer.length;
	var big = (x > y) ? x : y;
	this.scale.x = big / x;
	this.scale.y = big / y;

	//セルの大きさを決める
	this.cellWidth = this.sizeX / this.blueprint.answer[0].length;
	this.cellHeight = this.sizeY / this.blueprint.answer.length;

	this.cellContainer = this.addChild(new Pixim.Container());
	this.cellArray = new Array();

	this.bufCell;//選択されたセル記録用

	this.nCell = 0;//入力できるセルの数
	this.nAnswered = 0;//入力数
	this.correctAnswer = 0;//正答数

	this.hintCellArray = new Array();
	this.selectNum = 0;
	this.squareBorder = this.addChild(new SquareBorder(0xff0000));

	this.containerInputBox = this.addChild(new Pixim.Container());//入力フォーム保持用
	this.inputBox = this.createInputBox();
	this.inputBox.x = 50;
	this.inputBox.y = $.height - 100;
	this.containerInputBox.addChild(this.inputBox);
}

Board.prototype = Object.create(Pixim.Container.prototype);

Board.prototype.create = function(){
	var self = this;

	var answer = this.blueprint.answer;

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
			var cell = new Cell(isActive, x, y, this.cellWidth, this.cellHeight);
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
/*
Board.prototype.createInputBox = function(cell){
	var self = this;
	var answer = this.blueprint.answer;
	this.containerInputBox.removeChildren();
	var inputBox = this.containerInputBox.addChild(new InputBox(cell, 0, self.sizeY * 0.1 + self.sizeY));
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
			self.squareBorder.remove();
		}
		self.emit('close');
	});

	return inputBox;
}
*/
Board.prototype.createInputBox = function(){
	var self = this;
	var answer = this.blueprint.answer;
	var inputBox = new InputBox();
	inputBox.on('input', function(char, charOld){
		if(self.bufCell === undefined) return;
		if(char == charOld) return;
		if(charOld == ''){
			//入力された
			self.nAnswered++;
		}
		if(char == answer[self.bufCell.posY][self.bufCell.posX]){
			//正解になった
			self.correctAnswer++;
		}
		else if(charOld == answer[self.bufCell.posY][self.bufCell.posX]){
			//間違いになった
			self.correctAnswer--;
		}
		self.checkAnswer();
	});
	inputBox.on('delete', function(charOld){
		if(self.bufCell === undefined) return;
		if(charOld != ''){
			//入力が取り消された
			self.nAnswered--;
		}
	});
/*
	inputBox.on('close', function(){
		if(self.bufCell === undefined) return;
		self.containerInputBox.removeChildren();
		self.bufCell.setTexture(self.$.resources.images.back1);
		self.bufCell = undefined;
		if(self.hintCellArray.length > 0){
			self.squareBorder.remove();
		}
		self.emit('close');
	});
*/
	inputBox.on('left', function(){
		if(self.hintCellArray.length <= 0) return;
		self.bufCell.setTexture(self.$.resources.images.back1);
		self.selectNum = ((self.selectNum - 1) + self.hintCellArray.length) % self.hintCellArray.length;
		self.bufCell = self.hintCellArray[self.selectNum];
		self.bufCell.setTexture(self.$.resources.images.back2);
		self.inputBox.setCell(self.bufCell);
	});
	inputBox.on('right', function(){
		if(self.hintCellArray.length <= 0) return;
		self.bufCell.setTexture(self.$.resources.images.back1);
		self.selectNum = ((self.selectNum + 1) + self.hintCellArray.length) % self.hintCellArray.length;
		self.bufCell = self.hintCellArray[self.selectNum];
		self.bufCell.setTexture(self.$.resources.images.back2);
		self.inputBox.setCell(self.bufCell);
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

	//正答数が満たない
	if(this.nCell > this.correctAnswer){
		//this.emit('error');
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
	}

	//選択箇所の表示
	cell.setTexture(this.$.resources.images.back2);

	this.inputBox.setCell(cell);
}
//セルをタップで選択したとき
Board.prototype.tapCell = function(cell){
	if(this.hintCellArray.length > 0){
		for(var i = this.hintCellArray.length; i > 0; i--){
			var buf = this.hintCellArray.shift();
			buf.setTexture(this.$.resources.images.back1);
		}
		//枠線を消す
		this.squareBorder.remove();
	}
	this.selectCell(cell);
	this.emit('tap');
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
			//cell.setTexture(images.back3);
			this.hintCellArray.push(cell);
		}
		//枠線
		var x = this.hintCellArray[0].x;
		var y = this.hintCellArray[0].y;
		var width = this.hintCellArray.length * this.cellWidth;
		var height = this.cellHeight;
		this.squareBorder.setRect(x, y, width, height);
	}
	else{
		//Y軸方向
		for(var i = y; (i < this.cellArray.length); i++){
			if(this.cellArray[i][x].isActive == false) break;
			var cell = this.cellArray[i][x];
			//cell.setTexture(images.back3);
			this.hintCellArray.push(cell);
		}
		//枠線
		var x = this.hintCellArray[0].x;
		var y = this.hintCellArray[0].y;
		var width = this.cellWidth;
		var height = this.hintCellArray.length * this.cellHeight;
		this.squareBorder.setRect(x, y, width, height);
	}

	//先頭を選択状態にする
	var cell = this.hintCellArray[0];
	//矢印キーを使えるようにする
	//var inputBox = this.selectCell(cell);
	this.selectCell(cell);
	this.inputBox.setCell(cell);
}


var Button = function(char, charset){
	Pixim.Container.call(this);

	this.charset = charset;

	this.backWidth = 25;
	this.backHeight = 25;

	this.graphics = this.addChild(new PIXI.Graphics());
	this.graphics.beginFill(0x808080);
	this.graphics.drawRect(0,0,this.backWidth,this.backHeight);
	this.graphics.endFill();

	var style = {
		fontSize: 20,
		fill: 0xffffff,
	}
	this.text = this.addChild(new PIXI.Text(char, style));
	this.text.anchor.x = 0.5;
	this.text.anchor.y = 0.5;
	this.text.x = (this.backWidth - 0) / 2;
	this.text.y = (this.backHeight - 0) / 2;

	this.down = 0;
}

Button.prototype = Object.create(Pixim.Container.prototype);


var CharButton = function(char){
	Pixim.Container.call(this);

	this.x = 0;
	this.y = 0;

	this.char = char;

	this.backWidth = 25;
	this.backHeight = 25;

	this.graphics = this.addChild(new PIXI.Graphics());
	this.graphics.beginFill(0x808080);
	this.graphics.drawRect(0,0,this.backWidth,this.backHeight);
	this.graphics.endFill();

	var style = {
		fontSize: 20,
		fill: 0xffffff,
	}
	this.text = this.addChild(new PIXI.Text(char, style));
	this.text.anchor.x = 0.5;
	this.text.anchor.y = 0.5;
	this.text.x = (this.backWidth - 0) / 2;
	this.text.y = (this.backHeight - 0) / 2;
}

CharButton.prototype = Object.create(Pixim.Container.prototype);


//指定されたセルに対する入力
var InputBox = function(){
	Pixim.Container.call(this);

	this.bufButton;//押されたボタン記録用

	var self = this;

	this.cell;

	this.charnum = 0;

	this.containerButton = this.addChild(new Pixim.Container());
	this.containerCharButton = this.containerButton.addChild(new Pixim.Container());
	this.containerSysButton = this.containerButton.addChild(new Pixim.Container());
	this.containerBack = this.addChild(new Pixim.Container());
	this.containerAroundButton = new Pixim.Container();
	this.squareBorder = this.addChild(new SquareBorder(0xff0000));

	function setText(text){
		if(self.cell === undefined) return;
		self.cell.text.text = text;
	}

	function getText(){
		if(self.cell === undefined) return;
		return self.cell.text.text;
	}

	for(var i = 0; i < CharSet.length; i++){
		var button = this.containerCharButton.addChild(new Button(CharSet[i][0], CharSet[i]));
		button.x = (25+1)*i;
		button.y = 0;
		button.on('pointerdown', function(){
			this.down = 1;
			//違うボタンを押したか
			if(self.bufButton != this){
				self.bufButton = this;//押されたボタンを記録
				self.charnum = 0;//文字０番目をセット
			}
			var char = this.charset[self.charnum % this.charset.length];
			var charOld = getText();
			setText(char);
			self.charnum++;
			self.emit('input', char, charOld);

			//self.containerAroundButton.removeChildren();
			self.createAroundButton(this.charset, 25);
			self.containerAroundButton.x = this.x;
			self.containerAroundButton.y = this.y;

			var back = self.containerBack.addChild(new PIXI.Graphics());
			back.beginFill(0,0.5);
			back.drawRect(0,0,300,300);
			back.endFill();
		});
		button.on('pointerup', function(){
			this.down = 0;
			self.squareBorder.remove();
			self.containerAroundButton.removeChildren();
			self.containerBack.removeChildren();
		});
		button.on('pointerupoutside', function(obj){
			this.down = 0;
			self.squareBorder.remove();
			if(self.containerAroundButton.children.length <= 0) return;
			var num;
			num = self.checkAroundButtonNum(this, obj.data.global);
			var charOld = getText();
			var char = self.containerAroundButton.children[num].char;
			setText(char);
			self.emit('input', char, charOld);
			self.charnum = 0;
			self.containerAroundButton.removeChildren();
			self.containerBack.removeChildren();
		});
		button.on('pointermove', function(obj){
			if(this.down == 0) return;
			if(self.containerAroundButton.children.length <= 0) return;
			var num;
			num = self.checkAroundButtonNum(this, obj.data.global);
			var button = self.containerAroundButton.children[num];
			var x = self.containerAroundButton.x + button.x;
			var y = self.containerAroundButton.y + button.y;
			var width = button.width;
			var height = button.height;
			self.squareBorder.setRect(x, y, width, height);
		});
		button.interactive = true;
		this.replaceCharButton(i);
	}

	//濁点ボタン
	var button = this.containerSysButton.addChild(new CharButton('゛'));
	button.x = 220;
	button.y = 0;
	button.on('pointerdown', function(){
		var dakuten = '\u3099';//濁点（゛）
		var charOld = getText();
		var char = charOld.normalize('NFD');//分解
		if(char[1] === undefined){
			//何も結合していなかった
			char = (char + dakuten);//濁点追加
			char = char.normalize('NFC');//結合
			if(char[1] !== undefined) return;//結合できなかった
		}
		else{
			//何かが結合していた
			if(char[1] == dakuten){
				char = char[0];//濁点除去
			}
			else{
				//濁点以外
				char = (char[0] + dakuten);//濁点追加
				char = char.normalize('NFC');//結合
				//if(char[1] !== undefined) return;//結合できなかった
			}
		}
		setText(char);
		self.emit('input', char, charOld);
	});
	button.interactive = true;

	//半濁点ボタン
	var button = this.containerSysButton.addChild(new CharButton('゜'));
	button.x = 250;
	button.y = 0;
	button.on('pointerdown', function(){
		var handakuten = '\u309a';
		var charOld = getText();
		var char = charOld.normalize('NFD');//分解
		if(char[1] === undefined){
			char = (char + handakuten);//半濁点追加
			char = char.normalize('NFC');//結合
			if(char[1] !== undefined) return;//結合できなかった
		}
		else{
			if(char[1] == handakuten){
				char = char[0];
			}
			else{
				char = (char[0] + handakuten);
				char = char.normalize('NFC');
			}
		}
		setText(char);
		self.emit('input', char, charOld);
	});
	button.interactive = true;

	//削除ボタン
	var button = this.containerSysButton.addChild(new CharButton('×'));
	button.x = 220;
	button.y = 50;
	button.on('pointerdown', function(){
		var charOld = getText();
		setText('');
		if(self.bufButton !== undefined){
			self.bufButton.charnum = 0;
		}
		self.emit('delete', charOld);
	});
	button.interactive = true;

/*
	//閉じるボタン
	var button = this.containerSysButton.addChild(new CharButton('閉'));
	button.x = 280;
	button.y = 50;
	button.on('pointerdown', function(){
		self.emit('close');
	});
	button.interactive = true;
*/
	//←ボタン
	var button = this.containerSysButton.addChild(new CharButton('←'));
	button.x = 250;
	button.y = 50;
	button.on('pointerdown', function(){
		self.emit('left');
	});
	button.interactive = true;

	//→ボタン
	var button = this.containerSysButton.addChild(new CharButton('→'));
	button.x = 280;
	button.y = 50;
	button.on('pointerdown', function(){
		self.emit('right');
	});
	button.interactive = true;

	this.addChild(this.containerAroundButton);
	this.interactiveChildren = true;
}

InputBox.prototype = Object.create(Pixim.Container.prototype);

InputBox.prototype.setCell = function(cell){
	this.cell = cell;
	this.charnum = 0;
}

InputBox.prototype.getText = function(){
	if(this.cell === undefined) return;
	return this.cell.text.text;
}

InputBox.prototype.setText = function(text){
	if(this.cell === undefined) return;
	this.cell.text.text = text;
}

InputBox.prototype.replaceCharButton = function(num){
	num = parseInt(num);
	if(num < 0 || num >= this.containerCharButton.length) return;

	var button = this.containerCharButton.children[num];
	button.x = parseInt(num % 5) * (button.backWidth + 20);
	button.y = parseInt(num / 5) * (button.backHeight + 20);
}

//ボタンの上下左右に４つだけ作って配置する
InputBox.prototype.createAroundButton = function(charset, range){
	var self = this;

	for(var i = 1; i < 5; i++){
		var button = this.containerAroundButton.addChild(new CharButton(charset[i]));
		button.on('pointerup', function(){
			var charOld = self.getText();
			self.setText(this.char);
			self.emit('input', this.char, charOld);
			//self.containerAroundButton.removeChildren();
		});
		button.interactive = true;
	}

	this.containerAroundButton.children[0].x = -range;//左
	this.containerAroundButton.children[1].y = -range;//右
	this.containerAroundButton.children[2].x = +range;//上
	this.containerAroundButton.children[3].y = +range;//下
}

InputBox.prototype.checkAroundButtonNum = function(obj, pointer){
	var num;
	var ox = obj.transform.worldTransform.tx + (obj.width / 2);
	var oy = obj.transform.worldTransform.ty + (obj.height / 2);
	var px = pointer.x;
	var py = pointer.y;
	var vx = px - ox;
	var vy = py - oy;
	if(vx > vy){
		var ax = Math.abs(vx);
		var ay = Math.abs(vy);
		if(ax > ay){
			//2
			num = 2;
		}
		else{
			//1
			num = 1;
		}
	}
	else{
		var ax = Math.abs(vx);
		var ay = Math.abs(vy);
		if(ax > ay){
			//0
			num = 0;
		}
				else{
			//3
			num = 3;
		}
	}
	return num;
}


var HintBox = function($, key, hint, width, height){
	Pixim.Container.call(this);

	var self = this;

	this.$ = $
	this.hint = hint;

	var fontsize = 20;

	//背景
	var graphics = this.addChild(new PIXI.Graphics());
	graphics.beginFill(0x808080);
	graphics.lineStyle(2, 0xffffff);
	graphics.drawRect(0,0,width,height);
	graphics.endFill();

	var down = false;
	var downpointY;
	var containerY;
	function pointerDown(obj){
		down = true;
		downpointY = obj.data.global.y;
		containerY = self.textContainer.y;
	}
	function pointerMove(obj){
		if(down != true) return;
		var posY = containerY + (obj.data.global.y - downpointY);
		textScrollY(posY);
	}
	function pointerUp(){
		down = false;
	}
	graphics.on('pointerdown', function(obj){
		pointerDown(obj);
	});
	graphics.on('pointermove', function(obj){
		pointerMove(obj);
	});
	graphics.on('pointerup', function(){
		pointerUp();
	});
	graphics.on('pointerupoutside', function(){
		pointerUp();
	});
	graphics.interactive = true;

	this.containerGraphics = this.addChild(new Pixim.Container());

	//文字
	var style = {
		fontSize: fontsize,
		fill: 0xffffff,
		wordWrap: true,
		wordWrapWidth: width,
		breakWords: true,
	}

	//種類
	var textName = this.addChild(new PIXI.Text(key, style));
	textName.x = 0;
	textName.y = 0;

	var keyPosY = textName.height;

	this.textContainer = this.addChild(new Pixim.Container());
	this.textContainer.y = keyPosY;

	function textVisible(){
		for(var i = 0; i < self.textContainer.children.length; i++){
			var t = self.textContainer.children[i];
			var y = self.textContainer.y + t.y;
			var h = y + t.height;
			if(y < keyPosY){
				t.visible = false;
			}
			else if(h > height){
				t.visible = false;
			}
			else{
				t.visible = true;
			}
		}
	}

	function textScrollY(value){
		var c = self.textContainer;
		var t = c.children[c.children.length-1];
		var h = t.y + t.height;
		if(h < height) return;
		c.y = value;
		//移動制限
		if(c.y > keyPosY){
			c.y = keyPosY;
		}
		else if(c.y + (h) < height){
			c.y = height - (h);
		}
		textVisible();
		self.removeGraphics();
	}

	//カギ
	var space = 20;
	var h = 0;
	for(var i = 0; i < hint.length; i++){
		var num = hint[i].num;
		var key = hint[i].key;
		var text = this.textContainer.addChild(new PIXI.Text(num+","+key,style));
		text.x = 0;
		text.y = h;
		h += text.height + space;
		text.num = i;
		text.on('pointerdown', function(obj){
			var c = self.textContainer;
			self.createGraphics(c.x + this.x, c.y + this.y, this.width, this.height);
			self.emit('down', hint[this.num]);

		});
		text.interactive = true;
	}
	textVisible();
/*
	var button = this.addChild(new CharButton('↑'));
	button.x = 0;
	button.y = height;
	button.on('pointerdown', function(){
		textScrollY(10);
	});
	button.interactive = true;

	var button = this.addChild(new CharButton('↓'));
	button.x = 50;
	button.y = height;
	button.on('pointerdown', function(){
		textScrollY(-10);
	});
	button.interactive = true;
*/
}

HintBox.prototype = Object.create(Pixim.Container.prototype);

HintBox.prototype.createGraphics = function(x, y, width, height){
	this.containerGraphics.removeChildren();
	var back = this.containerGraphics.addChild(new PIXI.Graphics());
	back.x = x;
	back.y = y;
	back.beginFill(0xffff00, 0.25);
	back.drawRect(0, 0, width, height);
	back.endFill();
}

HintBox.prototype.removeGraphics = function(){
	this.containerGraphics.removeChildren();
}

HintBox.prototype.setInteractive = function(flag){
	this.interactive = flag;
}

HintBox.prototype.end = function(){
	this.interactiveChildren = false;
}


var Header = function($){
	Pixim.Container.call(this);

	var fontsize = 20;

	var style = {
		fontSize: fontsize,
		fill: 0xffffff,
	}

	this.textTime = this.addChild(new PIXI.Text('0',style));
	this.textTime.x = 0;
	this.textTime.y = 0;

	this.textMessage = this.addChild(new PIXI.Text('',style));
	this.textMessage.x = 200;
	this.textMessage.y = $.height - 100;
}

Header.prototype = Object.create(Pixim.Container.prototype);

Header.prototype.viewTime = function(time){
	time = parseInt(time);
	this.textTime.text = 'TIME : ' + time;
}

Header.prototype.viewMessage = function(message){
	this.textMessage.text = message;
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


var TextButton = function(text, num){
	Pixim.Container.call(this);

	this.num = num;

	var fontsize = 20;

	//背景
	this.graphics = this.addChild(new PIXI.Graphics());

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

	this.graphics.beginFill(0x808080);
	this.graphics.drawRect(0, 0, this.text.width, this.text.height);
	this.graphics.endFill();
}

TextButton.prototype = Object.create(Pixim.Container.prototype);


var SquareBorder = function(color){
	Pixim.Container.call(this);

	this.color = color;

	this.containerGraphics = this.addChild(new Pixim.Container());
	this.graphics = this.containerGraphics.addChild(new PIXI.Graphics());
}

SquareBorder.prototype = Object.create(Pixim.Container.prototype);

SquareBorder.prototype.setRect = function(x, y, width, height){
	this.x = x;
	this.y = y;
	this.containerGraphics.removeChildren();
	this.graphics = this.containerGraphics.addChild(new PIXI.Graphics());
	this.graphics.lineStyle(2, this.color);
	this.graphics.moveTo(0, 0)
	.lineTo(width, 0)
	.lineTo(width, height)
	.lineTo(0, height)
	.lineTo(0, 0);
}

SquareBorder.prototype.remove = function(){
	this.containerGraphics.removeChildren();
}


var Root = function($){
	Pixim.Container.call(this);

	this.$ = $;

	var self = this;

	this.containerIngame = this.addChild(new Pixim.Container());
	this.containerOutgame = this.addChild(new Pixim.Container());
	this.containerPopup = this.addChild(new Pixim.Container());
	this.containerPopup.x = 100;
	this.containerPopup.y = 100;

	this.toOutgame();
}

Root.prototype = Object.create(Pixim.Container.prototype);

Root.prototype.toIngame = function(blueprint){
	this.containerOutgame.removeChildren();

	var $ = this.$;

	var self = this;

	this.header = this.containerIngame.addChild(new Header($));

	var small = ($.width < $.height) ? $.width : $.height;
	this.board = this.containerIngame.addChild(new Board($, blueprint, small, small));
	this.board.x = 0;
	this.board.y = 0;
	this.board.create();
	this.board.on('clear', function(){
		self.header.viewMessage('CLEAR');
		self.end();
	});
/*
	this.board.on('error', function(){
		self.header.viewMessage('ERROR');
	});
*/
	this.board.on('tap', function(){
		self.hintboxX.removeGraphics();
		self.hintboxY.removeGraphics();
	});
	this.board.on('close', function(){
		self.hintboxX.removeGraphics();
		self.hintboxY.removeGraphics();
	});

	this.hintboxX = this.containerIngame.addChild(new HintBox($, 'ヨコのカギ', blueprint.hintX, $.width/2, 200));
	this.hintboxX.x = 0;
	this.hintboxX.y = small;
	this.hintboxX.on('down', function(obj){
		self.hintboxY.removeGraphics();
		self.board.selectHintCell(obj, 0);
	});

	this.hintboxY = this.containerIngame.addChild(new HintBox($, 'タテのカギ', blueprint.hintY, $.width/2, 200));
	this.hintboxY.x = $.width/2;
	this.hintboxY.y = small;
	this.hintboxY.on('down', function(obj){
		self.hintboxX.removeGraphics();
		self.board.selectHintCell(obj, 1);
	});


	this.watch = this.containerIngame.addChild(new Watch(300,0));
	this.watch.on('update', function(time){
		self.header.viewTime(time);
	});
	this.watch.start();

	//選択画面に戻るボタン
	var button = this.containerIngame.addChild(new CharButton('戻'));
	button.x = $.width - 30;
	button.y = $.height - 30;
	button.on('pointerdown', function(){
		if(self.containerPopup.children.length > 0){
			self.setInteractive(true);
			self.containerPopup.removeChildren();
		}
		else{
			self.setInteractive(false);
			self.popup();
		}
	});
	button.interactive = true;
}

Root.prototype.toOutgame = function(){
	this.containerIngame.removeChildren();

	var $ = this.$;

	var self = this;
	for(var i = 0; i < CrosswordList.length; i++){
		var button = this.containerOutgame.addChild(new TextButton(CrosswordList[i], i));
		button.x = 0;
		button.y = 30*i;
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
	this.hintboxX.end();
	this.hintboxY.end();
}

Root.prototype.setInteractive = function(flag){
	this.board.interactiveChildren = flag;
	this.hintboxX.interactiveChildren = flag;
	this.hintboxY.interactiveChildren = flag;
}

Root.prototype.popup = function(){
	var self = this;

	var width = 200;
	var height = 200;

	var back = new PIXI.Graphics();
	back.beginFill(0x808080);
	back.lineStyle(2, 0xff0000);
	back.drawRect(0, 0, width, height);
	back.endFill();

	var style = {
		fontSize:20,
		fill:0xffffff,
	}

	var t1 = new PIXI.Text('continue', style);
	t1.x = 20;
	t1.y = 100;
	t1.on('pointerdown', function(){
		self.setInteractive(true);
		self.containerPopup.removeChildren();
	});
	t1.interactive = true;

	var t2 = new PIXI.Text('end', style);
	t2.x = 120;
	t2.y = 100;
	t2.on('pointerdown', function(){
		self.setInteractive(false);
		self.containerPopup.removeChildren();
		self.watch.end();
		self.toOutgame();
	});
	t2.interactive = true;

	var g1 = new PIXI.Graphics();
	g1.beginFill(0x808080);
	g1.lineStyle(2, 0xff0000);
	g1.drawRect(t1.x, t1.y, t1.width, t1.height);
	g1.endFill();

	var g2 = new PIXI.Graphics();
	g2.beginFill(0x808080);
	g2.lineStyle(2, 0xff0000);
	g2.drawRect(t2.x, t2.y, t2.width, t2.height);
	g2.endFill();

	this.containerPopup.addChild(back);
	this.containerPopup.addChild(g1);
	this.containerPopup.addChild(t1);
	this.containerPopup.addChild(g2);
	this.containerPopup.addChild(t2);
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