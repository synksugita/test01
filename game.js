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

//テクスチャ
let texture = [];
texture[0] = PIXI.Texture.from("numbers/0.png");
texture[1] = PIXI.Texture.from("numbers/1.png");
texture[2] = PIXI.Texture.from("numbers/2.png");
texture[3] = PIXI.Texture.from("numbers/3.png");
texture[4] = PIXI.Texture.from("numbers/4.png");
texture[5] = PIXI.Texture.from("numbers/5.png");
texture[6] = PIXI.Texture.from("numbers/6.png");
texture[7] = PIXI.Texture.from("numbers/7.png");
texture[8] = PIXI.Texture.from("numbers/8.png");
texture[9] = PIXI.Texture.from("numbers/9.png");

const objectArray = new Array();


//計測開始
watch.start();

//関数ループ命令
app.ticker.add(delta => this.gameloop(delta));

//--------------------------------


//function
//--------------------------------


function createObject(){
	
	const sprite = new PIXI.Sprite();
	sprite.kind = parseInt(Math.random() * 10 + 1);
	sprite.moveValue = sprite.kind;
	sprite.texture = texture[sprite.kind - 1];
	sprite.width = 50;
	sprite.height = 50;
	sprite.x = Math.random() * (app.screen.width - sprite.width);
	sprite.y = 0;// - sprite.height;
	sprite.interactive = true;
	sprite.on('mousedown',clickEvent);
	
	objectContainer.addChild(sprite);
	objectArray.push(sprite);
}
function releaseObject(number){
	const obj = objectArray.splice(number,1);
	obj.texture = 0;
	objectContainer.removeChild(obj);
}
function clickEvent(){
	score += this.kind;
	this.kind = 0;
	this.texture = 0;
}

//--------------------------------


//mainloop
//--------------------------------

function gameloop(delta){

	const passedtime = parseInt(InitialTime - watch.getPassedTime()/1000);

	textTime.text = "TIME : " + passedtime;
	textScore.text = "SCORE : " + score;

	if(passedtime > 0){
		if(passedtime != timeOld){
			createObject();
		}
		timeOld = passedtime;
		watch.update();
		for(let i = 0; i < objectArray.length; i++){
			const obj = objectArray[i];
			obj.y += obj.moveValue;
			if(obj.y > app.screen.height){
				releaseObject(i);
			}
		}
	}
	else{
		for(let i = 0; i < objectArray.length; i++){
			releaseObject(i);
		}
	}
}

//--------------------------------