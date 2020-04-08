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

//アプリ初期化
var app = new PIXI.Application({
	width: 800,
	height: 600,
	backgroundColor: 0x000000,
});
document.body.appendChild(app.view);
var stage = app.stage.addChild(new PIXI.Graphics());

//オブジェクトコンテナ
var objectContainer = new PIXI.Container();
app.stage.addChild(objectContainer);

var header = new PIXI.Container();
app.stage.addChild(header);

var textTime = new PIXI.Text('TIME',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'});
textTime.x = app.screen.width/2;
header.addChild(textTime);

var textScore = new PIXI.Text('SCORE',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'});
textScore.x = app.screen.width/4*3;
header.addChild(textScore);


//計測開始
watch.start();

//関数ループ命令
app.ticker.add(gameloop);

//--------------------------------


//function
//--------------------------------


function createObject(){
	var kind = parseInt(Math.random() * 10);
	var sprite = new PIXI.Sprite(PIXI.Texture.from("numbers/" + kind + ".png"));
	sprite.kind = kind + 1;
	sprite.moveValue = sprite.kind;
	sprite.width = 50;
	sprite.height = 50;
	sprite.x = Math.random() * (app.screen.width - sprite.width);
	sprite.y = 0 - sprite.height;
	sprite.interactive = true;
	sprite.on('mousedown',clickEvent);
	
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

	const passedtime = parseInt(InitialTime - watch.getPassedTime()/1000);

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
			if(obj.y < app.screen.height){
				obj.y += obj.moveValue;
			}
			else{
				releaseObject(i);
				continue;
			}
		}
	}
	else{
		textTime.text = "";
		textScore.text = "SCORE : " + score;
		textScore.x = app.screen.width/2;
		textScore.y = app.screen.height/2;

		objectContainer.removeChildren();
		app.ticker.remove(gameloop);
	}
}

//--------------------------------