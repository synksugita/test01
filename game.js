//definition
//--------------------------------

var ObjectContainer = function($){
	Pixim.Container.call(this);

	this.data = $;

	this.score = 0;//スコア
}
ObjectContainer.prototype = new Pixim.Container();
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
	sprite.parent = this;

	sprite.on('pointerdown',this.clickEvent);

	this.addChild(sprite);
}
ObjectContainer.prototype.releaseObject = function(number){
	this.removeChildAt(number);
}
ObjectContainer.prototype.clickEvent = function(){
console.log(this.parent);
	this.parent.score += this.moveValue;
	this.kind = 0;
	this.texture = 0;
}

var Header = function($){
	Pixim.Container.call(this);

	this.textTime = new PIXI.Text('TIME',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'});
	this.textTime.x = $.width/2;
	this.textTime.anchor.x = 0.5;
	this.addChild(this.textTime);

	this.textScore = new PIXI.Text('SCORE',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'});
	this.textScore.x = $.width/4*3;
	this.textScore.anchor.x = 0.5;
	this.addChild(this.textScore);
}
Header.prototype = new Pixim.Container();

var Root = function($){
	Pixim.Container.call(this);

	this.InitialTime = 30;//初期時間
	this.timeOld = this.InitialTime;//前フレームの時間
	this.bufTime = 0;//経過時間保存用

	this.objectContainer = new $.lib.objectContainer($);
	this.addChild(this.objectContainer);
	this.header = new $.lib.header($);
	this.addChild(this.header);

	this.task.on('anim',function(e){this.gameloop(e, $)});
}
Root.prototype = new Pixim.Container();
Root.prototype.gameloop = function(e, $){
	this.bufTime += e.delta / 60;
	var passedtime = parseInt(this.InitialTime - this.bufTime);

	if(passedtime > 0){
		//時間内処理

		//1秒タイマー
		if(passedtime != this.timeOld){
			this.objectContainer.createObject();
			this.timeOld = passedtime;
		}

		for(var i = this.objectContainer.children.length - 1; i >= 0; i--){
			var obj = this.objectContainer.children[i];
			if(obj.y > $.height){
				this.objectContainer.releaseObject(i);
				continue;
			}
			obj.y += obj.moveValue;
		}

		this.header.textTime.text = "TIME : " + passedtime;
		this.header.textScore.text = "SCORE : " + this.objectContainer.score;
	}
	else{
		//時間外処理

		this.objectContainer.removeChildren();

		this.header.textTime.text = "TIME IS UP";
		this.header.textScore.text = "SCORE : " + this.objectContainer.score;
		this.header.textScore.x = $.width/2;
		this.header.textScore.y = $.height/2;

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