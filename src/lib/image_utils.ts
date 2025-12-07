export const isImage = (filePath: string) => {
  return ['.HEIC', '.JPEG', '.JPG', '.PNG'].some((ext) => {
    return filePath.toLowerCase().endsWith(ext.toLowerCase());
  });
};
