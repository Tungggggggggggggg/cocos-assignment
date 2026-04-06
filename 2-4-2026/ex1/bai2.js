function formatMoneyShorten(amount) {
    let suffix = "";
    let value = amount;

    if (amount >= 1000000000) {
        value = amount / 1000000000;
        suffix = "B";
    } else if (amount >= 1000000) {
        value = amount / 1000000;
        suffix = "M";
    } else if (amount >= 1000) {
        value = amount / 1000;
        suffix = "K";
    } else {
        return amount.toString();
    }

    let formatted = parseFloat(value.toFixed(2));
    return formatted + suffix;
}

console.log(formatMoneyShorten(1000));
console.log(formatMoneyShorten(1123400000));
console.log(formatMoneyShorten(1342222));
