//definition
//--------------------------------

var ObjectContainer = function($){
	Pixim.Container.call(this);

	this.data = $;

	//タイマー用変数
	this.bufTime = 0;//時間差の記録用
}
ObjectContainer.prototype = new Pixim.Container();
ObjectContainer.prototype.update = function(deltaTime){
	this.bufTime += deltaTime;

	//１秒タイマー
	var FPS = 60;
	if(this.bufTime >= FPS){
		//オブジェクトを生成
		this.createObject();
		var num = this.bufTime / FPS;
		this.bufTime -= num * FPS;
	}

	for(var i = this.children.length - 1; i >= 0; i--){
		if(this.children[i].y > this.data.height){
			this.releaseObject(i);
		}
		this.moveObject(i, deltaTime);
	}
}
ObjectContainer.prototype.moveObject = function(number, deltaTime){
	this.children[number].y += this.children[number].moveValue * deltaTime;
}
ObjectContainer.prototype.createObject = function(){
	var kind = parseInt(Math.random() * 10);
	var sprite = new PIXI.Sprite(this.data.resources.images['number' + kind]);
	sprite.kind = kind + 1;
	sprite.moveValue = sprite.kind;
	sprite.width = 50;
	sprite.height = 50;
	sprite.x = Math.random() * (this.data.width - sprite.width);
	sprite.y = 0 - sprite.height;
	sprite.interactive = true;

	sprite.on('pointerdown',this.clickEvent);

	this.addChild(sprite);
}
ObjectContainer.prototype.releaseObject = function(number){
	this.removeChildAt(number);
}
ObjectContainer.prototype.end = function(){
	this.removeChildren();
}
ObjectContainer.prototype.clickEvent = function(){
	this.parent.parent.score += this.moveValue;
	this.kind = 0;
	this.texture = 0;
}

var Header = function($){
	Pixim.Container.call(this);

	this.data = $;

	this.textTime = new PIXI.Text('TIME',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'});
	this.textTime.x = $.width / 2;
	this.textTime.anchor.x = 0.5;
	this.addChild(this.textTime);

	this.textScore = new PIXI.Text('SCORE',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'});
	this.textScore.x = $.width/4*3;
	this.textScore.anchor.x = 0.5;
	this.addChild(this.textScore);
}
Header.prototype = new Pixim.Container();
Header.prototype.ingame = function(time, score){
	//時間表示
	this.textTime.text = "TIME : " + time;
	this.textTime.x = this.data.width / 2;
	this.textTime.y = 0;
	this.textTime.anchor.x = 0.5;
	this.textTime.anchor.y = 0;

	//得点表示
	this.textScore.text = "SCORE : " + score;
	this.textScore.x = this.data.width / 4 * 3;
	this.textScore.y = 0;
	this.textScore.anchor.x = 0.5;
	this.textScore.anchor.y = 0;
}
Header.prototype.result = function(time, score){
	//時間表示
	this.textTime.text = "TIME IS OUT";
	this.textTime.x = this.data.width / 2;
	this.textTime.y = 0;
	this.textTime.anchor.x = 0.5;
	this.textTime.anchor.y = 0;

	//得点表示
	this.textScore.text = "SCORE : " + score;
	this.textScore.x = this.data.width / 2;
	this.textScore.y = this.data.height / 2;
	this.textScore.anchor.x = 0.5;
	this.textScore.anchor.y = 0.5;
}

var Root = function($){
	Pixim.Container.call(this);

	this.InitialTime = 30;//初期時間
	this.bufTime = 0;//経過時間保存用

	this.score = 0;//得点

	this.objectContainer = new $.lib.objectContainer($);
	this.addChild(this.objectContainer);
	this.header = new $.lib.header($);
	this.addChild(this.header);

	this.task.on('anim',function(e){this.gameloop(e)});
}
Root.prototype = new Pixim.Container();
Root.prototype.gameloop = function(e){
	this.bufTime += e.delta / 60;
	var passedtime = parseInt(this.InitialTime - this.bufTime + 1);

	if(passedtime > 0){
		//時間内処理

		this.objectContainer.update(e.delta);

		this.header.ingame(passedtime, this.score);
	}
	else{
		//時間外処理
		this.objectContainer.end();

		this.header.result(passedtime, this.score);

		this.task.clear('anim');
		console.log('end');
	}
}

//--------------------------------


//initialization
//--------------------------------

//Create content
Pixim.Content.create('testgame');
var content = Pixim.Content.get('testgame');

content.setConfig({
	width: 600,
	height: 600
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
	header: Header
});


//Create application
var app = new Pixim.Application({
	width: content._piximData.config.width,
	height: content._piximData.config.height
});

//--------------------------------


//Attach content to application and run application
app.attachAsync(new content())
	.then(function(){
		app.play();
	});