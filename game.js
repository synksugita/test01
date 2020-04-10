//definition
//--------------------------------

var Watch = function(){
	this.dateStart = new Date();
	this.dateNow = new Date();
};
Watch.prototype.start = function(){
	this.dateStart = new Date();
};
Watch.prototype.update = function(){
	this.dateNow = new Date();
};
Watch.prototype.getPassedTime = function(){
	return this.dateNow.getTime() - this.dateStart.getTime();
};
var watch = new Watch();
var InitialTime = 30;

var score = 0;
var timeOld = InitialTime;

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

var data;
content.defineLibraries({
	root: class Root extends Pixim.Container{
		constructor($){
			super();
			data = $;

			this.addChild(objectContainer);
			this.addChild(header);

			watch.start();

			this.task.on('anim',gameloop);
		}
	},
});

//オブジェクトコンテナ
var objectContainer = new PIXI.Container();

var header = new PIXI.Container();

var textTime = new PIXI.Text('TIME',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'});
textTime.x = app.view.width/2;
header.addChild(textTime);

var textScore = new PIXI.Text('SCORE',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'});
textScore.x = app.view.width/4*3;
header.addChild(textScore);

//--------------------------------


//function
//--------------------------------


function createObject(){
	var kind = parseInt(Math.random() * 10);
	var sprite = new PIXI.Sprite(data.resources.images["number" + kind]);
	sprite.kind = kind + 1;
	sprite.moveValue = sprite.kind;
	sprite.width = 50;
	sprite.height = 50;
	sprite.x = Math.random() * (app.view.width - sprite.width);
	sprite.y = 0;// - sprite.height;
	sprite.interactive = true;
	sprite.on('mousedown',clickEvent).on('touchstart',clickEvent);

	objectContainer.addChild(sprite);
}
function releaseObject(number){
	objectContainer.removeChildAt(number);
}
function clickEvent(){
	score += this.moveValue;
	this.kind = 0;
	this.texture = 0;
}

//--------------------------------


//mainloop
//--------------------------------

function gameloop(){

	var passedtime = parseInt(InitialTime - watch.getPassedTime()/1000);

	textTime.text = "TIME : " + passedtime;
	textScore.text = "SCORE : " + score;

	if(passedtime > 0){

		if(passedtime != timeOld){
			createObject();
		}
		timeOld = passedtime;
		watch.update();

		//コンテナの中身をインデックス指定で１つずつ削除する場合、
		//最後尾からアクセスして削除していけば
		//問題なく動作すると思いました。
		for(var i = objectContainer.children.length - 1; i >= 0; i--){
			var obj = objectContainer.children[i];
			if(obj.y >= app.view.height){
				releaseObject(i);
				continue;
			}
			obj.y += obj.moveValue;
		}
	}
	else{
		textTime.text = "";
		textScore.text = "SCORE : " + score;
		textScore.x = app.view.width/2;
		textScore.y = app.view.height/2;

		objectContainer.removeChildren();
		this.task.off('anim',gameloop);
	}
}


//Attach content to application and run application
app.attachAsync(new content())
	.then(function(){
		app.play();
	});

//--------------------------------