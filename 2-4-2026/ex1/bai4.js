function getFileExtension(filename) {
  if (!filename || !filename.includes(".")) return "";
  const ext = filename.split(".").pop();
  return ext === filename ? "" : ext;
}

console.log(getFileExtension("image.png"));
console.log(getFileExtension("Sound.mp3"));
console.log(getFileExtension("document.pdf"));
console.log(getFileExtension("docs.xlsx.pptx"));
console.log(getFileExtension("noextension"));
console.log(getFileExtension(".gitignore"));
