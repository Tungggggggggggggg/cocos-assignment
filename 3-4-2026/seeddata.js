import Library from "./library";

function createSampleData() {
    const lib = new Library();

    lib.addBook("Clean Code", "Robert Martin", 2008);
    lib.addBook("The Pragmatic Programmer", "Andrew Hunt", 1999);
    lib.addBook("JavaScript: The Good Parts", "Douglas Crockford", 2008);
    lib.addBook("You Don't Know JS", "Kyle Simpson", 2015);
    lib.addBook("Design Patterns", "Gang of Four", 1994);

    lib.addMember("Nguyen Van A", "a@email.com");
    lib.addMember("Tran Thi B", "b@email.com");

    return lib;
}

export default createSampleData;
