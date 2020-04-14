//definition
//--------------------------------

var ObjectContainer = function(){
	Pixim.Container.call(this);

	this.data = 0;
	this.score = 0;
}
ObjectContainer.prototype = new Pixim.Container();
ObjectContainer.prototype.createObject = function(){
	var kind = parseInt(Math.random() * 10);
	var sprite = new PIXI.Sprite(this.data.resources.images["number" + kind]);
	sprite.kind = kind + 1;
	sprite.moveValue = sprite.kind;
	sprite.width = 50;
	sprite.height = 50;
	sprite.x = Math.random() * (app.view.width - sprite.width);
	sprite.y = 0;// - sprite.height;
	sprite.interactive = true;
	sprite.parent = this;

	sprite.on('pointerdown',this.clickEvent);

	this.addChild(sprite);
}
ObjectContainer.prototype.releaseObject = function(number){
	this.removeChildAt(number);
}
ObjectContainer.prototype.clickEvent = function(){
	this.parent.score += this.moveValue;
	this.kind = 0;
	this.texture = 0;
}

var Header = function(){
	Pixim.Container.call(this);

	this.InitialTime = 30;
	this.timeOld = this.InitialTime;
	this.bufTime = 0;

	this.textTime = new PIXI.Text('TIME',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'});
	this.textTime.x = app.view.width/2;
	this.addChild(this.textTime);
	this.textScore = new PIXI.Text('SCORE',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'});
	this.textScore.x = app.view.width/4*3;
	this.addChild(this.textScore);
}
Header.prototype = new Pixim.Container();

var Root = function(data){
	Pixim.Container.call(this);

	this.objectContainer = new ObjectContainer();
	this.addChild(this.objectContainer);
	this.header = new Header();
	this.addChild(this.header);

	this.objectContainer.data = data;

	this.start();
}
Root.prototype = new Pixim.Container();
Root.prototype.start = function(){
	this.task.on('anim',function(e){this.gameloop(e)});
}
Root.prototype.gameloop = function(e){
	this.header.bufTime += e.delta / 60;
	var passedtime = parseInt(this.header.InitialTime - this.header.bufTime);

	this.header.textTime.text = "TIME : " + passedtime;
	this.header.textScore.text = "SCORE : " + this.objectContainer.score;

	if(passedtime > 0){

		if(passedtime != this.header.timeOld){
			this.objectContainer.createObject();
		}
		this.header.timeOld = passedtime;

		for(var i = this.objectContainer.children.length - 1; i >= 0; i--){
			var obj = this.objectContainer.children[i];
			if(obj.y > app.view.height){
				this.objectContainer.releaseObject(i);
				continue;
			}
			obj.y += obj.moveValue;
		}
	}
	else{
		this.header.textTime.text = "";
		this.header.textScore.text = "SCORE : " + this.objectContainer.score;
		this.header.textScore.x = app.view.width/2;
		this.header.textScore.y = app.view.height/2;

		this.objectContainer.removeChildren();
		this.task.destroy();
		console.log('end');
	}
}

//--------------------------------


//initialization
//--------------------------------

//Create application
var app = new Pixim.Application({width:600,height:600});

//Create content
Pixim.Content.create('testgame');
var content = Pixim.Content.get('testgame');

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
});

//--------------------------------


//Attach content to application and run application
app.attachAsync(new content())
	.then(function(){
		app.play();
	});