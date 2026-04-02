function combination(n, k) {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;

    k = Math.min(k, n - k);

    let result = 1;
    for (let i = 0; i < k; i++) {
        result = (result * (n - i)) / (i + 1);
    }

    return Math.round(result);
}

console.log(combination(5, 2));
console.log(combination(10, 3));
