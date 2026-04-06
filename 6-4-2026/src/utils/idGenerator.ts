import { v4 as uuidv4 } from "uuid";

export const idGenerator = {
    generateId(): string {
        return uuidv4();
    },

    generateBarcode(): string {
        const uuid = uuidv4().split("-");
        const barcodePart = (uuid[0] + uuid[1]).substring(0, 8).toUpperCase();
        return `B-${barcodePart.substring(0, 4)}-${barcodePart.substring(4, 8)}`;
    },
};
