//definition
//--------------------------------

var FPS = 60;
var InitialTime = 30;

var ObjectContainer = function($, root) {
	Pixim.Container.call(this);

	this.data = $;
	this.root = root;

	//タイマー用変数
	this.bufTime = 0;//時間差の記録用

	this.on('selectObj', function(obj, point){
		this.selectObj(obj, point);
	});
}

ObjectContainer.prototype = Object.create(Pixim.Container.prototype);

ObjectContainer.prototype.update = function(deltaTime) {
	this.bufTime += deltaTime;

	//１秒タイマー
	if (this.bufTime >= FPS){
		//オブジェクトを生成
		this.createObject();

		this.bufTime -= FPS;
	}

	for(var i = this.children.length - 1; i >= 0; i--) {
		var obj = this.children[i];

		//オブジェクトを移動させる
		this.moveObject(obj, deltaTime);

		//画面外まで行ったら消す
		if (obj.y > this.data.height) {
			this.releaseObject(obj);
		}
	}
}

ObjectContainer.prototype.moveObject = function(obj, deltaTime){
	obj.y += obj.moveValue * deltaTime;
}

function Obj(point, texture, container) {
	Pixim.Container.call(this);

	this.moveValue = this.point = point;

	var sprite = this.addChild(new PIXI.Sprite(texture));

	sprite.width = 50;
	sprite.height = 50;

	this.on('pointerdown', function() {
		container.emit('selectObj', this, this.point);
	});

	this.interactive = true;
}

Obj.prototype = Object.create(Pixim.Container.prototype);

ObjectContainer.prototype.createObject = function() {
	var kind = parseInt(Math.random() * 10);

	var obj = this.addChild(new Obj(kind + 1, this.data.resources.images['number' + kind], this));

	obj.x = Math.random() * (this.data.width - obj.width);
	obj.y = -obj.height;
}

ObjectContainer.prototype.selectObj = function(obj, point) {
	//this.root.addScore(point);
	this.root.emit('addScore', point);
	this.releaseObject(obj);
}

ObjectContainer.prototype.releaseObject = function(obj) {
	this.removeChild(obj);
}

ObjectContainer.prototype.end = function() {
	this.removeChildren();
}

var Header = function($){
	Pixim.Container.call(this);

	this.data = $;

	this.textTime = this.addChild(new PIXI.Text('TIME',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'}));
	this.textTime.x = $.width / 2;
	this.textTime.anchor.x = 0.5;

	this.textScore = this.addChild(new PIXI.Text('SCORE',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'}));
	this.textScore.x = $.width / 4 * 3;
	this.textScore.anchor.x = 0.5;
}
Header.prototype = Object.create(Pixim.Container.prototype);

Header.prototype.updateTime = function(time) {
	this.textTime.text = "TIME : " + time;
}

Header.prototype.updateScore = function(score) {
	this.textScore.text = "SCORE : " + score;
}

Header.prototype.viewResult = function(score) {
	//時間表示
	this.textTime.text = "TIME IS OUT";

	//得点表示
	this.textScore.text = "SCORE : " + score;
	this.textScore.x = this.data.width / 2;
	this.textScore.y = this.data.height / 2;
	this.textScore.anchor.x = 0.5;
	this.textScore.anchor.y = 0.5;
}

var Root = function($){
	Pixim.Container.call(this);

	this.initialTime = InitialTime; //初期時間
	this.bufTime = 0; //経過時間保存用

	this.score = 0; //得点

	this.objectContainer = this.addChild(new $.lib.objectContainer($, this));

	this.header = this.addChild(new $.lib.header($));

	this.header.updateScore(this.score);

	this.task.on('anim', this.gameloop);

	this.on('addScore', function(score){
		this.addScore(score);
	});
}

Root.prototype = Object.create(Pixim.Container.prototype);

Root.prototype.gameloop = function(e){
	this.bufTime += e.delta / 60;
	var passedtime = parseInt(this.initialTime - this.bufTime + 1);

	if(passedtime > 0){
		//時間内処理
		this.objectContainer.update(e.delta);
		this.header.updateTime(passedtime);
	}
	else{
		//時間外処理
		this.objectContainer.end();

		this.header.viewResult(this.score);

		this.task.clear('anim');
	}
}

Root.prototype.addScore = function(score) {
	this.score += score;
	this.header.updateScore(this.score);
}

//--------------------------------


//initialization
//--------------------------------

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
});

content.defineLibraries({
	root: Root,
	objectContainer: ObjectContainer,
	header: Header,
});


//Create application
var app = new Pixim.Application({
	width: 600,
	height: 600
});

//--------------------------------


//Attach content to application and run application
app.attachAsync(new content())
	.then(function(){
		app.play();
	});