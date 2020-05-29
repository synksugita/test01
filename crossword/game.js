function Root($){
	Pixim.Container.call(this);

	var self = this;

	var ingame = new Ingame($);
	var outgame = new Outgame($);

	ingame.on('end', function(){
		this.emit('release');
		outgame.emit('create');
	});
	outgame.on('select', function(blueprint){
		this.emit('release');
		ingame.emit('create', blueprint);
	});

	this.addChild(ingame);
	this.addChild(outgame);

	outgame.emit('create');
}

Root.prototype = Object.create(Pixim.Container.prototype);


function Ingame($){
	Pixim.Container.call(this);

	var self = this;

	var popup;
	var board;
	var keyboard;

	var isClear = false;

	var g = new PIXI.Graphics();
	g.beginFill(0,0.5);
	g.drawRect(0,0,$.width,$.height);
	g.endFill();
	g.visible = false;

	var style = {
		fontSize:20,
		fill:0xffffff,
	}

	var t = new PIXI.Text('CLEAR', style);
	t.visible = false;

	function setInteractive(flag){
		if(isClear == true) flag = false;
		board.interactiveChildren = flag;
		keyboard.interactiveChildren = flag;
	}

	var popflag = false;
	function popupVisible(flag){
		popflag = flag;
		g.visible = flag;
		if(isClear == true) t.visible = flag;
		popup.visible = flag;
		popup.interactiveChildren = flag;
		setInteractive((flag != true));
	}

	function create(blueprint){
		isClear = false;

		var b = new TextButton('戻', style);
		b.x = $.width - 50;
		b.y = $.height - 50;
		b.g.beginFill(0x808080);
		b.g.drawRect(0,0,b.t.width,b.t.height);
		b.g.endFill();
		b.on('pointerdown', function(){
			popupVisible((popflag != true));
		});
		b.interactive = true;

		popup = new Popup();
		popup.x = 100;
		popup.y = 100;
		popup.on('select', function(flag){
			popupVisible(false);
			if(flag == true){
				//self.intaractiveChildren = true;
			}
			else{
				self.emit('end');
			}
		});

		board = new Board($, blueprint);
		board.on('end', function(){
			isClear = true;
			popupVisible(true);
			//self.emit('end');
		});

		keyboard = new KeyBoard();
		keyboard.x = 50;
		keyboard.y = $.height - 100;
		keyboard.on('input', function(char){
			board.emit('input', char);
		});
		keyboard.on('selectMove', function(move){
			board.emit('selectMove', move);
		});
		keyboard.on('dakuten', function(){
			board.emit('dakuten');
		});
		keyboard.on('handakuten', function(){
			board.emit('handakuten');
		});

		t.x = popup.x + 50;
		t.y = popup.y + 20;

		popupVisible(false);


		self.addChild(board);
		self.addChild(keyboard);
		self.addChild(b);
		self.addChild(g);
		self.addChild(popup);
		self.addChild(t);
	}

	function release(){
		self.removeChildren();
	}

	this.on('create', function(blueprint){
		create(blueprint);
	});

	this.on('release', function(){
		release();
	});

}

Ingame.prototype = Object.create(Pixim.Container.prototype);


function Popup(){
	Pixim.Container.call(this);

	var self = this;

	var g = new PIXI.Graphics();
	g.beginFill(0x808080);
	g.lineStyle(2, 0xffffff);
	g.drawRect(0, 0, 200, 200);
	g.endFill();

	var style = {
		fontSize:20,
		fill:0xffffff,
	}

	var t1 = new TextButton('continue',style);
	t1.x = 50;
	t1.y = 50;
	t1.g.beginFill(0x808080);
	t1.g.lineStyle(2,0xffffff);
	t1.g.drawRect(0,0,t1.t.width,t1.t.height);
	t1.g.endFill();
	t1.on('pointerdown', function(){
		self.emit('select', true);
	});
	t1.interactive = true;
	var t2 = new TextButton('end',style);
	t2.x = 50;
	t2.y = 100;
	t2.g.beginFill(0x808080);
	t2.g.lineStyle(2,0xffffff);
	t2.g.drawRect(0,0,t2.t.width,t2.t.height);
	t2.g.endFill();
	t2.on('pointerdown', function(){
		self.emit('select', false);
	});
	t2.interactive = true;

	this.addChild(g);
	this.addChild(t1);
	this.addChild(t2);
}

Popup.prototype = Object.create(Pixim.Container.prototype);


function Board($, blueprint){
	Pixim.Container.call(this);

	var self = this;

	var small = ($.width < $.height) ? $.width : $.height;
	var width = small;
	var height = small;

	var field = new Field(blueprint, width, height);
	var hintboxX = new Hintbox(blueprint.hintX, 'ヨコのカギ', $.width/2, 200);
	hintboxX.x = 0;
	hintboxX.y = height;
	var hintboxY = new Hintbox(blueprint.hintY, 'タテのカギ', $.width/2, 200);
	hintboxY.x = $.width/2;
	hintboxY.y = height;

	var selectedHint;
	var selectedKey;
	function selectKey(hint, key){
		if(selectedKey !== undefined){
			if(selectedKey == key){
				selectedHint.emit('deselectKey');
				field.emit('deselect');
				//selectedHint = undefined;
				selectedKey = undefined;
				return;
			}
		}
		selectedHint = hint;
		selectedKey = key;
	}

	field.on('end', function(){
		self.emit('end');
	});
	field.on('tapCell', function(){
		selectKey(selectedHint, selectedKey);
		//hintboxX.emit('deselectKey');
		//hintboxY.emit('deselectKey');
	});

	hintboxX.on('select', function(key){
		hintboxY.emit('deselectKey');
		field.emit('selectKeyX', key.num);
		selectKey(this, key);
	});
	hintboxX.on('scroll', function(){
		this.emit('deselectKey');
		hintboxY.emit('deselectKey');
		field.emit('deselect');
	});

	hintboxY.on('select', function(key){
		hintboxX.emit('deselectKey');
		field.emit('selectKeyY', key.num);
		selectKey(this, key);
	});
	hintboxY.on('scroll', function(){
		this.emit('deselectKey');
		hintboxX.emit('deselectKey');
		field.emit('deselect');
	});


	this.on('input', function(char){
		field.emit('input', char);
	});
	this.on('selectMove', function(move){
		field.emit('selectMove', move);
	});
	this.on('dakuten', function(){
		field.emit('dakuten');
	});
	this.on('handakuten', function(){
		field.emit('handakuten');
	});


	this.addChild(field);
	this.addChild(hintboxX);
	this.addChild(hintboxY);
}

Board.prototype = Object.create(Pixim.Container.prototype);


function Field(blueprint, width, height){
	Pixim.Container.call(this);

	var self = this;

	var nCell = 0;
	var nAnswered = 0;
	var nAnswer = 0;

	var listLine = new PIXI.Graphics();
	var cellColor = new PIXI.Graphics();

	var selectedCell;
	var selectedList;
	var selectPos = 0;

	var listX = new Array();
	var listY = new Array();

	function listOnLine(list){
		listLine.clear();
		listLine.beginFill(0,0);
		listLine.lineStyle(2,0xff0000);
		listLine.drawRect(list.x, list.y, list.w, list.h);
		listLine.endFill();
	}

	function cellOnColor(cell){
		cellColor.clear();
		cellColor.beginFill(0xff0000, 0.5);
		cellColor.drawRect(cell.x, cell.y, cellWidth, cellHeight);
		cellColor.endFill();
	}

	function selectCell(cell){
		if(cell.isActive == false) return;
/*
		if(selectedCell !== undefined){
			if(selectedCell == cell){
				deselect();
				return;
			}
		}
*/
		cellOnColor(cell);
		cell.emit('select');
		selectedCell = cell;
	}

	function tapCell(cell){
		self.emit('tapCell');
		listLine.clear();
		selectCell(cell);
	}

	function selectList(list){
/*
		if(selectedList !== undefined){
			if(selectedList == list){
				deselect();
				return;
			}
		}
*/

		listOnLine(list);

		selectedList = list;
		selectPos = 0;
		selectCell(list.cellList[0]);
	}

	this.on('selectKeyX', function(num){
		selectList(listX[num]);
	});

	this.on('selectKeyY', function(num){
		selectList(listY[num]);
	});

	function deselect(){
		selectedCell = undefined;
		selectedList = undefined;
		cellColor.clear();
		listLine.clear();
	}

	this.on('deselect', function(){
		deselect();
	});

	var containerCell = new Pixim.Container();
	var arrayCell = new Array();

	var answer = blueprint.answer;

	var big = (answer[0].length > answer.length) ? answer[0].length : answer.length;
	var cellWidth = width / big;
	var cellHeight = height / big;
	if(answer[0].length > answer.length){
		containerCell.y = Math.abs((answer[0].length - answer.length) / 2 * cellHeight);
	}
	else{
		containerCell.x = Math.abs((answer[0].length - answer.length) / 2 * cellHeight);
	}
	listLine.x = containerCell.x;
	listLine.y = containerCell.y;
	cellColor.x = containerCell.x;
	cellColor.y = containerCell.y;
	for(var y = 0; y < answer.length; y++){
		var line = new Array();
		for(var x = 0; x < answer[y].length; x++){
			var isActive = (answer[y][x] == '') ? false : true;
			if(isActive == true) nCell++;
			var cell = new Cell(cellWidth, cellHeight, isActive);
			cell.x = cellWidth * x;
			cell.y = cellHeight * y;
			cell.on('pointerdown', function(){
				tapCell(this);
			});
			cell.interactive = true;

			line.push(cell);
			containerCell.addChild(cell);
		}
		arrayCell.push(line);
	}

	var hintX = blueprint.hintX;
	for(var i = 0; i < hintX.length; i++){
		var x = hintX[i].x - 1;
		var y = hintX[i].y - 1;
		var num = hintX[i].num;
		arrayCell[y][x].emit('setNum', num);

		var cells = new Array();
		for(j = x; j < answer[y].length; j++){
			if(answer[y][j] == '') break;
			var cell = arrayCell[y][j];
			cells.push(cell);
		}
		listX.push({
			cellList: cells,
			x: cells[0].x,
			y: cells[0].y,
			w: (cells[cells.length - 1].x - cells[0].x) + cellWidth,
			h: (cells[cells.length - 1].y - cells[0].y) + cellHeight,
		});
	}

	var hintY = blueprint.hintY;
	for(var i = 0; i < hintY.length; i++){
		var x = hintY[i].x - 1;
		var y = hintY[i].y - 1;
		var num = hintY[i].num;
		arrayCell[y][x].emit('setNum', num);

		var cells = new Array();
		for(j = y; j < answer.length; j++){
			if(answer[j][x] == '') break;
			var cell = arrayCell[j][x];
			cells.push(cell);
		}
		listY.push({
			cellList: cells,
			x: cells[0].x,
			y: cells[0].y,
			w: (cells[cells.length - 1].x - cells[0].x) + cellWidth,
			h: (cells[cells.length - 1].y - cells[0].y) + cellHeight,
		});
	}

	function checkAnswer(){
		if(nCell > nAnswered) return;
		else if(nAnswered > nAnswer) return;
		self.emit('end');
	}

	function inputCell(char){
		//if(selectedCell === undefined) return;
		var charOld = selectedCell.char.text;
		if(charOld == char) return console.log(false);
		var x = selectedCell.x / cellWidth;
		var y = selectedCell.y / cellHeight;
		if(charOld == ''){
			nAnswered++;
		}
		else if(char == ''){
			nAnswered--;
		}
		if(char == answer[y][x]){
			nAnswer++;
		}
		else if(charOld == answer[y][x]){
			nAnswer--;
		}
		checkAnswer();

		selectedCell.emit('setText', char);
	}

	this.on('input', function(char){
		if(selectedCell === undefined) return;
		inputCell(char);
	});
	this.on('selectMove', function(move){
		if(selectedList === undefined) return;
		var list = selectedList.cellList;
		selectPos = ((selectPos + move) + list.length) % list.length;
		var cell = list[selectPos];
		selectCell(cell);
	});
	this.on('dakuten', function(){
		if(selectedCell === undefined) return;
		var dakuten = '\u3099';
		var charOld = selectedCell.char.text;
		var char = charOld.normalize('NFD');
		if(char[1] === undefined){
			char = (char + dakuten);
			char = char.normalize('NFC');
			if(char[1] !== undefined) return;
		}
		else{
			if(char[1] == dakuten){
				char = char[0];
			}
			else{
				char = (char[0] + dakuten);
				char = char.normalize('NFC');
			}
		}
		inputCell(char);
	});
	this.on('handakuten', function(){
		if(selectedCell === undefined) return;
		var dakuten = '\u309a';
		var charOld = selectedCell.char.text;
		var char = charOld.normalize('NFD');
		if(char[1] === undefined){
			char = (char + dakuten);
			char = char.normalize('NFC');
			if(char[1] !== undefined) return;
		}
		else{
			if(char[1] == dakuten){
				char = char[0];
			}
			else{
				char = (char[0] + dakuten);
				char = char.normalize('NFC');
			}
		}
		inputCell(char);
	});


	this.addChild(containerCell);
	this.addChild(listLine);
	this.addChild(cellColor);
}

Field.prototype = Object.create(Pixim.Container.prototype);


function Cell(width, height, isActive){
	Pixim.Container.call(this);

	var self = this;

	//if(isActive === undefined) return;
	this.isActive = isActive;

	var backcolor;
	if(isActive == true){
		backcolor = 0x808080;
	}
	else{
		backcolor = 0xffffff;
	}

	var g = new PIXI.Graphics();
	g.beginFill(backcolor);
	g.lineStyle(2, 0);
	g.drawRect(0, 0, width, height);
	g.endFill();

	var small = (width < height) ? width : height;
	var style = {
		fontSize: small * 0.5,
		fill:0xffffff,
	}
	this.char = new PIXI.Text('', style);
	this.char.anchor.x = 0.5;
	this.char.anchor.y = 0.5;
	this.char.x = width/2;
	this.char.y = height/2;

	this.on('setText', function(text){
		self.char.text = text;
	});

	var style = {
		fontSize: small * 0.2,
		fill:0xffffff,
	}
	var num = new PIXI.Text('', style);

	this.on('setNum', function(text){
		num.text = text;
	});


	this.addChild(g);
	this.addChild(this.char);
	this.addChild(num);
}

Cell.prototype = Object.create(Pixim.Container.prototype);


function Hintbox(hint, title, width, height){
	Pixim.Container.call(this);

	var self = this;

	var g = new PIXI.Graphics();
	g.beginFill(0x808080);
	g.lineStyle(2, 0xffffff);
	g.drawRect(0, 0, width, height);
	g.endFill();

	var style = {
		fontSize: 20,
		fill:0xffffff,
		wordWrap: true,
		wordWrapWidth: width,
		breakWords: true,
	}

	var textTitle = new TextButton(title, style);

	var move = false;

	var space = 20;
	var h = 0;
	var containerKey = new Pixim.Container();
	containerKey.y = textTitle.height;
	var arrayKey = new Array();
	for(var i = 0; i < hint.length; i++){
		var num = hint[i].num;
		var key = new TextButton(num + ',' + hint[i].key, style);
		key.x = 0;
		key.y = h;
		h += key.t.height + space;
		key.num = i;
		key.on('pointertap', function(obj){
			if(move == true) return;
			selectKey(this);
			self.emit('select', this);
		});
		key.interactive = true;
		containerKey.addChild(key);
		arrayKey.push(key);
	}

	var mask = new PIXI.Graphics();
	mask.beginFill(0xffffff, 1);
	mask.drawRect(0, textTitle.height, width, height - textTitle.height);
	mask.endFill();
	containerKey.mask = mask;

	var style = {
		fontSize: 20,
		fill:0xffffff,
	}

	function textScroll(pos){
		var c = containerKey;
		var t = c.children[c.children.length - 1];
		var h = t.y + t.height;
		if(h < height) return;
		c.y = pos;
		if(c.y > textTitle.height){
			c.y = textTitle.height;
		}
		else if(c.y + h < height){
			c.y = height - h;
		}
	}

	var pointerY;
	var containerY;
	var down = false;
	var margin = 30;
	this.on('pointerdown', function(obj){
		down = true;
		pointerY = obj.data.global.y;
		containerY = containerKey.y;
	});
	this.on('pointermove', function(obj){
		if(down != true) return;
		//move = true;
		var v = obj.data.global.y - pointerY;
		if(move == false){
			if(Math.abs(v) > margin) move = true;
			else return;
		}
		var y = containerY + v;
		textScroll(y);
		self.emit('scroll');
	});
	this.on('pointerup', function(){
		down = false;
		move = false;
	});
	this.on('pointerupoutside', function(){
		down = false;
		move = false;
	});
	this.interactive = true;

	var marker = new PIXI.Graphics();
	marker.mask = mask;
	function selectKey(key){
		var x = containerKey.x + key.x;
		var y = containerKey.y + key.y;
		marker.clear();
		marker.beginFill(0xffff00, 0.5);
		marker.drawRect(x, y, key.width, key.height);
		marker.endFill();
	}

	function deselectKey(){
		selectedKey = undefined;
		marker.clear();
	}

	this.on('deselectKey', function(){
		deselectKey();
	})


	this.addChild(g);
	this.addChild(mask);
	this.addChild(textTitle);
	this.addChild(containerKey);
	this.addChild(marker);
}

Hintbox.prototype = Object.create(Pixim.Container.prototype);


function KeyBoard(){
	Pixim.Container.call(this);

	var self = this;

	var selectButton;
	var charnum = 0;
	function tapButton(button){
		if(selectButton !== undefined){
			if(selectButton != button){
				charnum = 0;
			}
		}
		self.emit('input', button.charset[charnum % button.charset.length]);
		selectButton = button;
		charnum++;
	}

	var g = new PIXI.Graphics();

	function inFlick(){
		g.beginFill(0, 0.5);
		g.drawRect(0, 0, 400, 400);
		g.endFill();
	}
	function outFlick(){
		g.clear();
	}

	var line = new PIXI.Graphics();
	function drawAroundLine(num){
		var width = containerFlickButton.children[0].t.width;
		var height = containerFlickButton.children[0].t.height;
		var b = containerAroundButton.children[num];
		line.x = containerAroundButton.x + b.x;
		line.y = containerAroundButton.y + b.y;
		line.clear();
		line.beginFill(0, 0);
		line.lineStyle(2, 0xff0000);
		line.drawRect(0, 0, width, height);
		line.endFill();
	}

	var containerFlickButton = new Pixim.Container();

	var containerAroundButton = new Pixim.Container();

	var downPosX;
	var downPosY;
	var down = false;

	var style = {
		fontSize:20,
		fill:0xffffff,
	}

	var selectedButton;
	for(var i = 0; i < CharSet.length; i++){
		var b = new CharsetButton(CharSet[i], style);
		b.g.beginFill(0x808080);
		b.g.drawRect(0, 0, b.t.width, b.t.height);
		b.g.endFill();
		b.x = 30 * i;
		b.y = 0;
		b.on('pointerdown', function(obj){
			selectedButton = this;
			createAroundButton(this);
			down = true;
			downPosX = obj.data.global.x;
			downPosY = obj.data.global.y;
			inFlick();
		});
		b.on('pointermove', function(obj){
			if(selectedButton != this) return;
			if(down != true) return;
			var num;// = checkNum(obj);
			if(checkOver(obj.data.global, this) == true) num = 0;
			else num = checkNum(obj);
			drawAroundLine(num);
		});
		b.on('pointerup', function(){
			if(selectedButton != this) return;
			tapButton(this);
			containerAroundButton.removeChildren();
			line.clear();
			down = false;
			//self.emit('input', this.charset[0]);
			outFlick();
		});
		b.on('pointerupoutside', function(obj){
			if(selectedButton != this) return;
			containerAroundButton.removeChildren();
			line.clear();
			down = false;
			var num = checkNum(obj);
			self.emit('input', this.charset[num]);
			outFlick();
			charnum = 0;
		});
		b.interactive = true;

		containerFlickButton.addChild(b);
	}

	function createAroundButton(button){
		var width = button.t.width;
		var height = button.t.height;

		for(var i = 0; i < 5; i++){
			var b = new TextButton(button.charset[i], style);
			b.g.beginFill(0x808080);
			b.g.drawRect(0, 0, width, height);
			b.g.endFill();
			containerAroundButton.addChild(b);
		}

		var range = 30;
		containerAroundButton.children[1].x = -range;
		containerAroundButton.children[2].y = -range;
		containerAroundButton.children[3].x = +range;
		containerAroundButton.children[4].y = +range;

		containerAroundButton.x = button.x;
		containerAroundButton.y = button.y;
	}

	function checkNum(obj){
		var vx = obj.data.global.x - downPosX;
		var vy = obj.data.global.y - downPosY;
		var ax = Math.abs(vx);
		var ay = Math.abs(vy);
		if(ax > ay){
			//左右
			if(vx > 0){
				//右
				return 3;
			}
			else{
				//左
				return 1;
			}
		}
		else{
			//上下
			if(vy > 0){
				//下
				return 4;
			}
			else{
				//上
				return 2;
			}
		}
	}

	function checkOver(pointer, button){
		var x = button.transform.worldTransform.tx;
		var y = button.transform.worldTransform.ty;
		var w = button.t.width;
		var h = button.t.height;
		if(x <= pointer.x && pointer.x <= x + w && y <= pointer.y && pointer.y <= y + h){
			return true;
		}
		else return false;
	}

	var buttonDelete = new TextButton('×', style);
	buttonDelete.x = 0;
	buttonDelete.y = 50;
	buttonDelete.g.beginFill(0x808080);
	buttonDelete.g.drawRect(0, 0, buttonDelete.t.width, buttonDelete.t.height);
	buttonDelete.g.endFill();
	buttonDelete.on('pointerdown', function(){
		self.emit('input', '');
	});
	buttonDelete.interactive = true;

	var buttonLeft = new TextButton('←', style);
	buttonLeft.x = 150;
	buttonLeft.y = 50;
	buttonLeft.g.beginFill(0x808080);
	buttonLeft.g.drawRect(0, 0, buttonLeft.t.width, buttonLeft.t.height);
	buttonLeft.g.endFill();
	buttonLeft.on('pointerdown', function(){
		self.emit('selectMove', -1);
	});
	buttonLeft.interactive = true;

	var buttonRight = new TextButton('→', style);
	buttonRight.x = 200;
	buttonRight.y = 50;
	buttonRight.g.beginFill(0x808080);
	buttonRight.g.drawRect(0, 0, buttonRight.t.width, buttonRight.t.height);
	buttonRight.g.endFill();
	buttonRight.on('pointerdown', function(){
		self.emit('selectMove', +1);
	});
	buttonRight.interactive = true;

	var buttonDakuten = new TextButton('゛', style);
	buttonDakuten.x = 50;
	buttonDakuten.y = 50;
	buttonDakuten.g.beginFill(0x808080);
	buttonDakuten.g.drawRect(0, 0, buttonDakuten.t.width, buttonDakuten.t.height);
	buttonDakuten.g.endFill();
	buttonDakuten.on('pointerdown', function(){
		self.emit('dakuten');
	});
	buttonDakuten.interactive = true;

	var buttonHandakuten = new TextButton('゜', style);
	buttonHandakuten.x = 100;
	buttonHandakuten.y = 50;
	buttonHandakuten.g.beginFill(0x808080);
	buttonHandakuten.g.drawRect(0, 0, buttonHandakuten.t.width, buttonHandakuten.t.height);
	buttonHandakuten.g.endFill();
	buttonHandakuten.on('pointerdown', function(){
		self.emit('handakuten');
	});
	buttonHandakuten.interactive = true;


	this.addChild(containerFlickButton);
	this.addChild(buttonDelete);
	this.addChild(buttonLeft);
	this.addChild(buttonRight);
	this.addChild(buttonDakuten);
	this.addChild(buttonHandakuten);
	this.addChild(g);
	this.addChild(containerAroundButton);
	this.addChild(line);
}

KeyBoard.prototype = Object.create(Pixim.Container.prototype);


function Outgame($){
	Pixim.Container.call(this);

	var self = this;

	var style = {
		fontSize:20,
		fill:0xffffff,
	}

	function create(){
		for(var i = 0; i < CrosswordList.length; i++){
			var b = new TextButton(CrosswordList[i], style);
			b.x = 0;
			b.y = 30*i;
			b.g.beginFill(0x808080);
			b.g.drawRect(0,0,b.t.width,b.t.height);
			b.g.endFill();
			b.on('pointerdown', function(){
				new PIXI.Loader().add("obj", this.t.text + ".json").load(function(loader, resources){
					var data = resources.obj.data;
					self.emit('select', data);
				});
			});
			b.interactive = true;
			self.addChild(b);
		}
	}

	function release(){
		self.removeChildren();
	}

	this.on('create', function(){
		create();
	});

	this.on('release', function(){
		release();
	});
}

Outgame.prototype = Object.create(Pixim.Container.prototype);



//Create content
var content = Pixim.Content.create();

content.setConfig({
	width: 450,
	height: 800,
});

content.defineImages({
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