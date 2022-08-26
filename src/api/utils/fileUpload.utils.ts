export const filename = (req, file, callback) => {
  const fileName = Date.now() + '-' + file.originalname;
  callback(null, fileName);
};

export const fileFilter = (req, file, callback) => {
  if (file) {
    if (!file.originalname.match(/\.(csv)$/)) {
      return callback(new Error('Wrong extension of file'), false);
    }
  }
  callback(null, true);
};
