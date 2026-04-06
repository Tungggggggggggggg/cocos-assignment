function findMissingElements(arr1, arr2) {
  const set1 = new Set(arr1);

  return arr2.filter((item) => !set1.has(item));
}

console.log(findMissingElements([1, 2, 3], [1, 2, 3, 4, 5]));
console.log(findMissingElements([1, 3, 5], [1, 2, 3, 4, 5]));
console.log(findMissingElements([], [1, 2, 3]));
