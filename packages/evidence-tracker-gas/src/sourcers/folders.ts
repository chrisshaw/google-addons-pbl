import { mapFolderChildren, getFolderById } from "../../../gas-utilities/gas-apis";

export function walkFolderWithFilter(folderId, fileFilter = (file?) => true) {
    const rootFolder = getFolderById(folderId)
    const fileMapper = (file) => {
        const passedFilter = fileFilter(file)
        if (passedFilter) {
            return file
        }
    }
    return mapFolderChildren(rootFolder, fileMapper)
}

export const getFiles = (folderId) => walkFolderWithFilter(folderId)