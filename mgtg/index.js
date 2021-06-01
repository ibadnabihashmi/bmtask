const fs              = require('fs');
const readline        = require('readline');

// The usefull regexes to parse different type of lines
const containsValue   = new RegExp(/^[a-z]+\s+is\s+[i|v|x|l|c|d|m]$/i);
const containsCredits = new RegExp(/^([a-z\s]+)is\s+(\d+.?\d*)\s+credits$/i);
const howMuch         = new RegExp(/^how\s+much\s+is\s+([a-z\s]+)[?]$/i);
const howMany         = new RegExp(/^how\s+many\s+credits\s+is\s+([a-z\s]+)[?]$/i);

// keeping the currrency values of items
const currency        = {};

// keeping the units valuees
const units           = {};

var romanNumerals     = [ 'i', 'v', 'x', 'l', 'c', 'd', 'm' ];

// this regex is used to validate a roman string
var isValidRomanRegEx = new RegExp(/^m{0,3}(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})$/);

var romanNumeralsVal  = {
  i : 1,
  v : 5,
  x : 10,
  l : 50,
  c : 100,
  d : 500,
  m : 1000
};

// reading the file line by line
const reader = readline.createInterface({
	input: fs.createReadStream('./input.txt'),
	terminal: false
});

// the below function is converting the items to the price value
function itemToValue(itemList) {
	let romanString = "";
	let answer = 0;
	for (let i = 0; i < itemList.length; i++) {
		if (currency[itemList[i].toLowerCase()]) {
			romanString += currency[itemList[i].toLowerCase()];
		}
	}
	if (!isValidRomanRegEx.test(romanString)) {
		console.log("Invalid amount " + itemList.join(" "));
		return -1;
	}
	const romanDigits = [];
	romanString.split("").forEach(function(e, i, arr) {
		romanDigits.push(romanNumeralsVal[e]);
		if (romanNumeralsVal[e] < romanNumeralsVal[arr[i + 1]]) {
			romanDigits[i] *= -1;
		}
	});
	answer = romanDigits.reduce(function(sum, elt) {
		return sum + elt;
	});
	return answer;
}

// below function takes a line as input
// extracts the item and its value and saves in `currency` map
const extractValues = (line) => {
  const values = containsValue.exec(line)[0].split(/\s+/);
  const item = values[0];
  const priceInRoman = values[2];

  if (!currency[item.toLowerCase()]) { // checking if already present
    const index = romanNumerals.indexOf(priceInRoman.toLowerCase());  // getting index of roman numeral
    if (index > -1) { // if roman numeral is found
      currency[item.toLowerCase()] = priceInRoman.toLowerCase(); // assign the value and add the key
      romanNumerals.splice(index, 1); // remove the numeral value , why?
    }
  }
}

// below function takes a line as input
// extracts the unit value and units such as silver, gold etc
const extractCredits = (line) => {
  const credit = containsCredits.exec(line)[2]; // parsing credits
  const items = containsCredits.exec(line)[1].trim().split(/\s+/); // parrsing items and splitting them
  const unit = items.pop(); // the last word in items is unit
	
	const value = credit / itemToValue(items);;
	units[unit.toLowerCase()] = value;
}

const extractHowMuch = (line) => {
  const items = howMuch.exec(line)[1].trim().split(/\s+/);
	const value = itemToValue(items);
	if (value !== -1) {
		return console.log(items.join(" ") + " is " + value);
	} else {
		return console.log("Invalid Currency");
	}
}

const extractHowMany = (line) => {
  const items = howMany.exec(line)[1].trim().split(/\s+/);
	const unit = items.pop();
	let value = itemToValue(items);
	if (value !== -1) {
		value *= units[unit.toLowerCase()];
		return console.log(howMany.exec(line)[1] + "is " + value.toFixed(0)
			+ " Credits");
	} else {
		return console.log("Invalid Currency");
	}
}

reader.on('line', l => {
  const line = l.trim();
  if (line.match(containsValue)) {
    extractValues(line);
  } else if (line.match(containsCredits)) {
    extractCredits(line);
  } else if (line.match(howMuch)) {
    extractHowMuch(line);
  } else if (line.match(howMany)) {
    extractHowMany(line);
  } else {
    console.log("I have no idea what you are talking about");
  }
});