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

	var b;
	var popup;
	var board;
	var keyboard;

	var isClear = false;

	var g = new PIXI.Graphics();
	g.beginFill(0,0.5);
	g.drawRect(0,0,$.width,$.height);
	g.endFill();
	g.visible = false;

	var keyWidth = 30;
	var keyHeight = 30;

	var style = {
		fontSize:20,
		fill:0xffffff,
	}

	var t = new PIXI.Text('CLEAR', style);
	t.visible = false;

	function setInteractive(flag){
		b.interactive = flag;
		if(isClear == true) flag = false;
		board.emit('setInteractive', flag);
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

		b = new TextButton('戻', style);
		b.x = $.width - keyWidth;
		b.y = $.height - keyHeight;
		b.g.beginFill(0x808080);
		b.g.drawRect(0, 0, keyWidth, keyHeight);
		b.g.endFill();
		b.t.x = keyWidth / 2;
		b.t.y = keyHeight / 2;
		b.t.anchor.x = 0.5;
		b.t.anchor.y = 0.5;
		b.on('pointerdown', function(){
			//popupVisible((popflag != true));
			popupVisible(true);
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
			keyboard.visible = false;
			//self.emit('end');
		});
		board.on('changeSelect', function(){
			keyboard.emit('resetKey');
console.log('change');
		});

		keyboard = new KeyBoard();
		keyboard.x = 80;
		keyboard.y = $.height - 110;
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
		keyboard.on('flick', function(char){
			board.emit('flick', char);
		});

		t.x = popup.x + 100;
		t.y = popup.y + 20;
		t.anchor.x = 0.5;
		t.anchor.y = 0.5;

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

	var backWidth = 200;
	var backHeight = 200;

	var g = new PIXI.Graphics();
	g.beginFill(0x808080);
	g.lineStyle(2, 0xffffff);
	g.drawRect(0, 0, backWidth, backHeight);
	g.endFill();

	var containerButton = new Pixim.Container();
	containerButton.x = 50;
	containerButton.y = 50;

	var buttonWidth = 100;
	var buttonHeight = 30;

	var style = {
		fontSize:20,
		fill:0xffffff,
	}

	for(i = 0; i < 2; i++){
		var b = new TextButton('', style);
		b.g.beginFill(0x808080);
		b.g.lineStyle(2, 0xffffff);
		b.g.drawRect(0, 0, buttonWidth, buttonHeight);
		b.g.endFill();
		b.t.x = buttonWidth / 2;
		b.t.y = buttonHeight / 2;
		b.t.anchor.x = 0.5;
		b.t.anchor.y = 0.5;
		b.interactive = true;
		containerButton.addChild(b);
	}

	var b = containerButton.children[0];
	b.t.text = 'close';
	b.x = 0;
	b.y = 0;
	b.on('pointerdown', function(){
		self.emit('select', true);
	});

	var b = containerButton.children[1];
	b.t.text = 'exit';
	b.x = 0;
	b.y = 50;
	b.on('pointerdown', function(){
		self.emit('select', false);
	});
	this.addChild(g);
	this.addChild(containerButton);
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
		field.emit('deselect');
		hintboxX.emit('deselectKey');
		hintboxY.emit('deselectKey');
		self.emit('end');
	});
	field.on('tapCell', function(){
		selectKey(selectedHint, selectedKey);
		//hintboxX.emit('deselectKey');
		//hintboxY.emit('deselectKey');
	});
	field.on('changeSelect', function(){
		self.emit('changeSelect');
	});

	hintboxX.on('select', function(key){
		hintboxY.emit('deselectKey');
		field.emit('selectKeyX', key.num);
		selectKey(this, key);
	});
/*
	hintboxX.on('scroll', function(){
		this.emit('deselectKey');
		hintboxY.emit('deselectKey');
		field.emit('deselect');
	});
*/

	hintboxY.on('select', function(key){
		hintboxX.emit('deselectKey');
		field.emit('selectKeyY', key.num);
		selectKey(this, key);
	});
/*
	hintboxY.on('scroll', function(){
		this.emit('deselectKey');
		hintboxX.emit('deselectKey');
		field.emit('deselect');
	});
*/


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
	this.on('flick', function(char){
		//field.emit('input', char);
		//field.emit('selectMove', 1);
field.emit('flick', char);
	});

	this.on('setInteractive', function(flag){
		field.interactiveChildren = flag;
		//hintboxX.interactiveChildren = flag;
		//hintboxY.interactiveChildren = flag;
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

	var isClear = false;

	var listLine = new PIXI.Graphics();
	var cellColor = new PIXI.Graphics();

	var selectedCell;
	var selectedList;
	var selectPos = 0;

var flicked = false;

	var listX = new Array();
	var listY = new Array();

	function listOnLine(list){
		listLine.clear();
		listLine.beginFill(0, 0);
		listLine.lineStyle(3, 0xff0000);
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

		if(selectedCell !== undefined){
			if(selectedCell == cell){
				//deselect();
				return;
			}
/*
			else{
				self.emit('changeSelect');
			}
*/
		}

		cellOnColor(cell);
		cell.emit('select');
		selectedCell = cell;
self.emit('changeSelect');
flicked = false;
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
		if(isClear == true) return;
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
		isClear = true;
		self.emit('end');
	}

	function inputCell(char){
		//if(selectedCell === undefined) return;
		var charOld = selectedCell.char.text;
		if(charOld == char) return;
		selectedCell.emit('setText', char);
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
flicked = false;
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
this.on('flick', function(char){
	if(selectedCell === undefined) return;
	if(flicked == true) this.emit('selectMove', 1);
	inputCell(char);
flicked = true;
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

	var backcolor = 0xffffff;

	
	var g = new PIXI.Graphics();
	g.beginFill(backcolor);
	g.lineStyle(2, 0);
	g.drawRect(0, 0, width, height);
	g.endFill();

	var space = 5;
	var black = new PIXI.Graphics();
	black.beginFill(0);
	black.drawRect(space, space, width - space*2, height - space*2);
	black.endFill();

	var small = (width < height) ? width : height;
	var style = {
		fontSize: small * 0.5,
		fill:0x000000,
	}
	this.char = new PIXI.Text('', style);
	this.char.anchor.x = 0.5;
	this.char.anchor.y = 0.5;
	this.char.x = width/2;
	this.char.y = height/2;

	var style = {
		fontSize: small * 0.2,
		fill:0x000000,
	}
	var num = new PIXI.Text('', style);


	black.visible = (isActive != true);
	this.char.visiblle = isActive;
	num.visible = isActive;


	this.on('setText', function(text){
		self.char.text = text;
	});

	this.on('setNum', function(text){
		num.text = text;
	});


	this.addChild(g);
	this.addChild(this.char);
	this.addChild(num);
	this.addChild(black);
}

Cell.prototype = Object.create(Pixim.Container.prototype);


function Hintbox(hint, title, width, height){
	Pixim.Container.call(this);

	var self = this;

	var backcolor = 0x808080;

	var g = new PIXI.Graphics();
	g.beginFill(backcolor);
	//g.lineStyle(2, 0xffffff);
	g.drawRect(0, 0, width, height);
	g.endFill();

	var line = new PIXI.Graphics();
	line.beginFill(0, 0);
	line.lineStyle(2, 0xffffff);
	line.drawRect(0, 0, width, height);
	line.endFill();

	var style = {
		fontSize: 20,
		fill:0xffffff,
		wordWrap: true,
		wordWrapWidth: width,
		breakWords: true,
	}

	var textTitle = new TextButton(title, style);

	var isSelectKey = false;
	var canSelectKey = true;
	var selectedKey;

	var space = 10;
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
		key.g.beginFill(backcolor);
		key.g.drawRect(0, 0, width, key.t.height);
		key.g.endFill();
		key.on('pointertap', function(obj){
			if(canSelectKey == false) return;
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
		if(isSelectKey == true){
			drawMarker(selectedKey);
		}
	}

	var down = false;
	var pointerY;
	var containerY;
	var margin = 15;
	this.on('pointerdown', function(obj){
		down = true;
		pointerY = obj.data.global.y;
		containerY = containerKey.y;
	});
	this.on('pointermove', function(obj){
		if(down != true) return;
		var v = obj.data.global.y - pointerY;
		if(Math.abs(v) > margin){
				canSelectKey = false;
			}
		var y = containerY + v;
		textScroll(y);
		self.emit('scroll');
	});
	this.on('pointerup', function(){
		down = false;
		canSelectKey = true;
	});
	this.on('pointerupoutside', function(){
		down = false;
		canSelectKey = true;
	});
	this.interactive = true;

	var marker = new PIXI.Graphics();
	marker.mask = mask;
	function drawMarker(key){
		var x = containerKey.x + key.x;
		var y = containerKey.y + key.y;
		marker.clear();
		marker.beginFill(0xffff00, 0.5);
		marker.drawRect(x, y, width, key.t.height);
		marker.endFill();
	}

	function selectKey(key){
		isSelectKey = true;
		selectedKey = key;
		drawMarker(key);
	}

	function deselectKey(){
		isSelectKey = false;
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
	this.addChild(line);
}

Hintbox.prototype = Object.create(Pixim.Container.prototype);


function KeyBoard(){
	Pixim.Container.call(this);

	var self = this;

	var keyWidth = 50;
	var keyHeight = 30;
	var keySpace = 5;

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
		var b = containerAroundButton.children[num];
		line.x = containerAroundButton.x + b.x;
		line.y = containerAroundButton.y + b.y;
		line.clear();
		line.beginFill(0, 0);
		line.lineStyle(2, 0xff0000);
		line.drawRect(0, 0, keyWidth, keyHeight);
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
		b.g.drawRect(0, 0, keyWidth, keyHeight);
		b.g.endFill();
		b.t.x = keyWidth / 2;
		b.t.y = keyHeight / 2;
		b.t.anchor.x = 0.5;
		b.t.anchor.y = 0.5;
		b.on('pointerdown', function(obj){
			selectedButton = this;
			createAroundButton(this);
			down = true;
			downPosX = obj.data.global.x;
			downPosY = obj.data.global.y;
			inFlick();
			drawAroundLine(0);
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
			line.clear();
			down = false;
			//self.emit('input', this.charset[0]);
			outFlick();
			containerAroundButton.removeChildren();
		});
		b.on('pointerupoutside', function(obj){
			if(selectedButton != this) return;
			line.clear();
			down = false;
			var num = checkNum(obj);
			//self.emit('input', this.charset[num]);
			self.emit('flick', this.charset[num]);
			outFlick();
			containerAroundButton.removeChildren();
			charnum = 0;
		});
		b.interactive = true;

		containerFlickButton.addChild(b);
	}

	function createAroundButton(button){
		var c = containerAroundButton;
		for(var i = 0; i < button.charset.length; i++){
			var char = button.charset[i];
			var b = new TextButton(char, style);
			b.g.beginFill(0x808080);
			b.g.drawRect(0, 0, keyWidth, keyHeight);
			b.g.endFill();
			b.t.x = keyWidth / 2;
			b.t.y = keyHeight / 2;
			b.t.anchor.x = 0.5;
			b.t.anchor.y = 0.5;
			c.addChild(b);
		}

		for(var i = 0; i < c.children.length - 1; i++){
			var b = c.children[i + 1];
			if(b === undefined) break;
			var deg = 90 * i;
			var rad = deg * (Math.PI / 180);
			b.x = -Math.cos(rad) * (keyWidth + keySpace);
			b.y = -Math.sin(rad) * (keyHeight + keySpace);
		}

		containerAroundButton.x = button.x;
		containerAroundButton.y = button.y;
	}

	function checkNum(obj){
		var num;
		var vx = obj.data.global.x - downPosX;
		var vy = obj.data.global.y - downPosY;
		var ax = Math.abs(vx);
		var ay = Math.abs(vy);
		if(ax > ay){
			//左右
			if(vx > 0){
				//右
				num = 3;
			}
			else{
				//左
				num = 1;
			}
		}
		else{
			//上下
			if(vy > 0){
				//下
				num = 4;
			}
			else{
				//上
				num = 2;
			}
		}
		if(containerAroundButton.children[num] === undefined) return 0;
		else return num;
	}

	function checkOver(pointer, button){
		var x = button.transform.worldTransform.tx;
		var y = button.transform.worldTransform.ty;
		var w = keyWidth;
		var h = keyHeight;
		if(x <= pointer.x && pointer.x <= x + w && y <= pointer.y && pointer.y <= y + h){
			return true;
		}
		else return false;
	}

	var containerButton = new Pixim.Container();
	for(var i = 0; i < 5; i++){
		var b = new TextButton('',style);
		b.g.beginFill(0x808080);
		b.g.drawRect(0, 0, keyWidth, keyHeight);
		b.g.endFill();
		b.t.x = keyWidth / 2;
		b.t.y = keyHeight / 2;
		b.t.anchor.x = 0.5;
		b.t.anchor.y = 0.5;
		b.interactive = true;
		containerButton.addChild(b);
	}

	var b = containerButton.children[0];
	b.t.text = '×';
	b.on('pointerdown', function(){
		self.emit('input', '');
	});

	var b = containerButton.children[1];
	b.t.text = '゛';
	b.on('pointerdown', function(){
		self.emit('dakuten');
	});

	var b = containerButton.children[2];
	b.t.text = '゜';
	b.on('pointerdown', function(){
		self.emit('handakuten');
	});

	var b = containerButton.children[3];
	b.t.text = '←';
	b.on('pointerdown', function(){
		self.emit('selectMove', -1);
	});

	var b = containerButton.children[4];
	b.t.text = '→';
	b.on('pointerdown', function(){
		self.emit('selectMove', +1);
	});


	for(var i = 0; i < containerFlickButton.children.length; i++){
		var b = containerFlickButton.children[i];
		b.x = (keyWidth + keySpace) * parseInt(i % 5);
		b.y = (keyHeight + keySpace) * parseInt(i / 5);
	}

	for(var i = 0; i < containerButton.children.length; i++){
		var b = containerButton.children[i];
		b.x = (keyWidth + keySpace) * parseInt(i % 5);
		b.y = (keyHeight + keySpace) * parseInt((i / 5) + 2);
	}


	this.on('resetKey', function(){
		charnum = 0;
	});


	this.addChild(containerFlickButton);
	this.addChild(containerButton);
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