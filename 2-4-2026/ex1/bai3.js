function countWords(str) {
    if (!str || str.length === 0) {
        return 0;
    }

    let count = 1;

    for (let i = 0; i < str.length; i++) {
        let char = str[i];
        if (char === char.toUpperCase() && char !== char.toLowerCase()) {
            count++;
        }
    }

    return count;
}

console.log(countWords("oneTwoThree"));
console.log(countWords("helloWorld"));
console.log(countWords("JavaScript"));
