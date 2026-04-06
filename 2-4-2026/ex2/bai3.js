function randomElement(arr) {
  if (!arr || arr.length === 0) return undefined;

  return arr[randomInt(0, arr.length - 1)];
}

console.log(randomElement([10, 20, 30, 40]));
console.log(randomElement([]));
