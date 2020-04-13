//definition
//--------------------------------

var Root = function(data){
	Pixim.Container.call(this);
	this.data = data;

	this.InitialTime = 30;
	this.timeOld = this.InitialTime;
	this.bufTime = 0;
	this.score = 0;

	this.objectContainer = new PIXI.Container();
	this.addChild(this.objectContainer);
	this.header = new PIXI.Container();
	this.addChild(this.header);

	this.textTime = new PIXI.Text('TIME',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'});
	this.textTime.x = app.view.width/2;
	this.header.addChild(this.textTime);
	this.textScore = new PIXI.Text('SCORE',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'});
	this.textScore.x = app.view.width/4*3;
	this.header.addChild(this.textScore);

	this.start();
}
Root.prototype = new Pixim.Container();
Root.prototype.start = function(){
	this.task.on('anim',function(e){this.gameloop(e)});
}
Root.prototype.createObject = function(){
	var kind = parseInt(Math.random() * 10);
	var sprite = new PIXI.Sprite(this.data.resources.images["number" + kind]);
	sprite.kind = kind + 1;
	sprite.moveValue = sprite.kind;
	sprite.width = 50;
	sprite.height = 50;
	sprite.x = Math.random() * (app.view.width - sprite.width);
	sprite.y = 0;// - sprite.height;
	sprite.interactive = true;

	var _click = 'pointerdown';
	sprite.on(_click,this.clickEvent);

	this.objectContainer.addChild(sprite);
}
Root.prototype.releaseObject = function(number){
	this.objectContainer.removeChildAt(number);
}
Root.prototype.clickEvent = function(){
	this.parent.parent.score += this.moveValue;
	this.texture = 0;
	this.kind = 0;
}
Root.prototype.gameloop = function(e){
	this.bufTime += e.delta;
	var passedtime = parseInt(this.InitialTime - this.bufTime);
	//var passedtime = parseInt(this.InitialTime - this.watch.getPassedTime()/1000);

	this.textTime.text = "TIME : " + passedtime;
	this.textScore.text = "SCORE : " + this.score;

	if(passedtime > 0){

		if(passedtime != this.timeOld){
			this.createObject(this.data);
		}
		this.timeOld = passedtime;

		//コンテナの中身をインデックス指定で１つずつ削除する場合、
		//最後尾からアクセスして削除していけば
		//問題なく動作すると思いました。
		for(var i = this.objectContainer.children.length - 1; i >= 0; i--){
			var obj = this.objectContainer.children[i];
			if(obj.y > app.view.height){
				this.releaseObject(i);
				continue;
			}
			obj.y += obj.moveValue;
		}
	}
	else{
		this.textTime.text = "";
		this.textScore.text = "SCORE : " + this.score;
		this.textScore.x = app.view.width/2;
		this.textScore.y = app.view.height/2;

		this.objectContainer.removeChildren();
		//this.task.off('anim',this.gameloop);
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