function formatMoney(amount) {
    let s = String(amount);
    let [intPart, decPart] = s.split(".");

    let result = "";
    let count = 0;

    for (let i = intPart.length - 1; i >= 0; i--) {
        count++;
        result = intPart[i] + result;

        if (count === 3 && i !== 0) {
            result = "," + result;
            count = 0;
        }
    }

    if (decPart) {
        return result + "." + decPart;
    }
    return result;
}

console.log(formatMoney(10000000));
console.log(formatMoney(123456));
console.log(formatMoney(12000.02));
