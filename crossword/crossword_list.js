var Blueprint = function(){
	this.answer = [
		['ミ','ツ','','シ','ラ','ハ'],
		['ア','ゲ','ダ','マ','','ネ'],
		['イ','','ル','イ','ジ',''],
		['','ア','マ','','カ','コ'],
		['ツ','タ','','ア','ン','コ'],
		['ナ','マ','ゴ','ミ','','ア'],
	];

	this.hintX = new Array();
	this.hintX.push(new Hint(1, 1, 1, "花の○○を吸う"));
	this.hintX.push(new Hint(3, 4, 1, "真剣○○○取り"));
	this.hintX.push(new Hint(5, 1, 2, "「タヌキうどん」に入っているもの"));
	this.hintX.push(new Hint(7, 3, 3, "人気商品の○○○品が出回る"));
	this.hintX.push(new Hint(9, 2, 4, "海に潜って魚介類を採る仕事"));
	this.hintX.push(new Hint(10, 5, 4, "○○→現在→未来"));
	this.hintX.push(new Hint(12, 1, 5, "壁を這う植物"));
	this.hintX.push(new Hint(13, 4, 5, "タイヤキに詰まっているもの"));
	this.hintX.push(new Hint(14, 1, 6, "料理をすると出る不要なもの"));
	this.hintX.name = 'ヨコのカギ';

	this.hintY = new Array();
	this.hintY.push(new Hint(1, 1, 1, "「恋愛」でなくコレで結婚"));
	this.hintY.push(new Hint(2, 2, 1, "「柘植」と書くハンコの材料になる木"));
	this.hintY.push(new Hint(3, 4, 1, "⇔兄弟"));
	this.hintY.push(new Hint(4, 6, 1, "蝶はコレを使って舞います"));
	this.hintY.push(new Hint(6, 3, 2, "願いが叶ったら目を描く縁起物"));
	this.hintY.push(new Hint(8, 5, 3, "サナギから脱皮するのに○○○が掛かる"));
	this.hintY.push(new Hint(9, 2, 4, "触覚がある部分"));
	this.hintY.push(new Hint(11, 6, 4, "「ホットチョコレート」とも呼ぶ飲み物"));
	this.hintY.push(new Hint(12, 1, 5, "運動会で引っ張り合うもの"));
	this.hintY.push(new Hint(13, 4, 5, "蝶を捕る道具"));
	this.hintY.name = 'タテのカギ';
}

var Blueprint2 = function(){
	this.answer = [
		['サ','サ','','カ','イ','カ'],
		['ヨ','','ユ','ゲ','','ダ'],
		['ウ','ワ','サ','','マ','ン'],
		['','ラ','イ','オ','ン',''],
		['タ','ビ','','シ','ナ','イ'],
		['ネ','','ア','ベ','カ','ワ'],
	];

	this.hintX = new Array();
	this.hintX.push(new Hint(   1,    1,    1,     "パンダの好物"));
	this.hintX.push(new Hint(   2,    4,    1,     "つぼみから咲くこと"));
	this.hintX.push(new Hint(   4,    3,    2,     "温かいお風呂から上がるもの"));
	this.hintX.push(new Hint(   5,    1,    3,     "人の○○○も七十五日"));
	this.hintX.push(new Hint(   7,    5,    3,     "一、十、百、千、○○"));
	this.hintX.push(new Hint(   8,    2,    4,     "タンポポは英語で「ダンデ○○○○」"));
	this.hintX.push(new Hint(  10,    1,    5,     "可愛い子にさせること"));
	this.hintX.push(new Hint(  11,    4,    5,     "剣道で振るもの"));
	this.hintX.push(new Hint(  13,    3,    6,     "海苔を巻いた○○○○餅"));
	this.hintX.name = 'ヨコのカギ';

	this.hintY = new Array();
	this.hintY.push(new Hint(   1,    1,    1,     "タンポポには利尿○○○がある"));
	this.hintY.push(new Hint(   2,    4,    1,     "光を遮るとできる"));
	this.hintY.push(new Hint(   3,    6,    1,     "庭の花を植えるところ"));
	this.hintY.push(new Hint(   4,    3,    2,     "⇔水彩"));
	this.hintY.push(new Hint(   6,    2,    3,     "でんぷんで作った○○○餅に黄粉をかけて食べる"));
	this.hintY.push(new Hint(   7,    5,    3,     "「次男」は三人兄弟のコレ"));
	this.hintY.push(new Hint(   9,    4,    4,     "⇔めしべ"));
	this.hintY.push(new Hint(  10,    1,    5,     "花が終わるとできるもの"));
	this.hintY.push(new Hint(  12,    6,    5,     "一念○○をも通す"));
	this.hintY.name = 'タテのカギ';
}


//配列でまとめる
var CrosswordList = new Array();
CrosswordList.push(new Blueprint());
CrosswordList.push(new Blueprint2());