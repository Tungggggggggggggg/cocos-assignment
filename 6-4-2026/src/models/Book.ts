export interface Book {
    id: string;
    isbn: string;
    title: string;
    author: string;
    category: string;
    isDeleted?: boolean;
}
