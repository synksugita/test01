//definition
//--------------------------------

//キー
class Key{
	constructor(){
		this.Right = 0;
		this.Left = 0;
		this.Down = 0;
		this.Up = 0;
	}
}
const key = new Key();

class Watch{

	constructor(){
		this.dateStart = new Date();
		this.dateNow = new Date();
	}

	start(){
		this.dateStart = new Date();
	}

	update(){
		this.dateNow = new Date();
	}

	getPassedTime(){
		return (this.dateNow.getTime() - this.dateStart.getTime());
	}

}
const watch = new Watch();
const InitialTime = 30;

let score = 0;
let timeOld = InitialTime;

//--------------------------------


//initialization
//--------------------------------

//アプリ初期化
const app = new PIXI.Application({
	width: 800,
	height: 600,
	backgroundColor: 0x000000,
});
document.body.appendChild(app.view);
let stage = app.stage.addChild(new PIXI.Graphics());

//オブジェクトコンテナ
const objectContainer = new PIXI.Container();
app.stage.addChild(objectContainer);

const header = new PIXI.Container();
app.stage.addChild(header);

const textTime = new PIXI.Text('TIME',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'});
textTime.x = app.screen.width/2;
header.addChild(textTime);
const textScore = new PIXI.Text('SCORE',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'});
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
	const kind = parseInt(Math.random() * 10);
	let texture = PIXI.Texture.from("numbers/" + kind + ".png");

	const sprite = new PIXI.Sprite(texture);
	sprite.kind = kind + 1;
	sprite.moveValue = sprite.kind;
	sprite.width = 50;
	sprite.height = 50;
	sprite.x = Math.random() * (app.screen.width - sprite.width);
	sprite.y = 0;// - sprite.height;
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
		for(let i = 0; i < objectContainer.children.length; i++){
			const obj = objectContainer.children[i];
			if(obj.y < app.screen.height){
				obj.y += obj.moveValue;
			}
			else{
				releaseObject(i);
				i--;
				continue;
			}
		}
	}
	else{
		textTime.text = "";
		textScore.text = "SCORE : " + score;
		textScore.x = app.screen.width/2;
		textScore.y = app.screen.height/2;

		for(let i = 0; i < objectContainer.children.length; i++){
			releaseObject(i);
			i--;
			continue;
		}
	}

}

//--------------------------------