var FPS = 60;

//ただの背景
function Button(){
	Pixim.Container.call(this);

	this.g = new PIXI.Graphics();

	this.addChild(this.g);
}

Button.prototype = Object.create(Pixim.Container.prototype);


function TextButton(text, style){
	Button.call(this);

	this.t = new PIXI.Text(text, style);

	this.addChild(this.t);
}

TextButton.prototype = Object.create(Button.prototype);


function CharsetButton(charset, style){
	TextButton.call(this, charset[0], style);

	this.charset = charset;
}

CharsetButton.prototype = Object.create(TextButton.prototype);