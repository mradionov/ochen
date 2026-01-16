const excludeNames = ['.DS_Store'];

export class FS {
  static async createDir(
    parentDirHandle: FileSystemDirectoryHandle,
    dirName: string,
  ) {
    return await parentDirHandle.getDirectoryHandle(dirName, {
      create: true,
    });
  }

  static async createFile(
    parentDirHandle: FileSystemDirectoryHandle,
    fileName: string,
  ) {
    return await parentDirHandle.getFileHandle(fileName, {
      create: true,
    });
  }

  static async copyFile(
    sourceFileHandle: FileSystemFileHandle,
    targetDirHandle: FileSystemDirectoryHandle,
    targetFileName: string,
  ) {
    const sourceFile = await sourceFileHandle.getFile();
    const targetFileHandle = await this.createFile(
      targetDirHandle,
      targetFileName,
    );

    const writable = await targetFileHandle.createWritable();
    await sourceFile.stream().pipeTo(writable);
  }

  static async deleteFile(
    parentDirHandle: FileSystemDirectoryHandle,
    fileName: string,
  ) {
    await parentDirHandle.removeEntry(fileName);
  }

  static async getDirItems(
    dirHandle: FileSystemDirectoryHandle,
    opts: { kind?: 'file' | 'directory'; sort?: boolean } = {},
  ) {
    const items = [];
    for await (const [name, handle] of dirHandle.entries()) {
      if (excludeNames.includes(name)) {
        continue;
      }
      if (opts.kind != null && handle.kind !== opts.kind) {
        continue;
      }
      items.push({
        name,
        handle,
      });
    }

    if (opts.sort) {
      items.sort((a, b) => a.name.localeCompare(b.name));
    }

    return items;
  }

  static async findDirHandleByName(
    parentDirHandle: FileSystemDirectoryHandle,
    dirName: string,
  ): Promise<FileSystemDirectoryHandle | undefined> {
    const dirItems = await this.getDirItems(parentDirHandle);
    const targetDirItem = dirItems.find(
      ({ name, handle }) => name === dirName && handle.kind === 'directory',
    );
    if (!targetDirItem) {
      return;
    }
    return targetDirItem.handle;
  }
}
