export const filename = (req, file, callback) => {
  let customFile = file.originalname.split('.')[0];
  customFile += Date.now() + '-' + Math.round(Math.random() * 16);
  let fileExtension = '';
  if (file.mimetype.indexOf('.csv') > -1) fileExtension = '.csv';
  customFile += fileExtension;
  callback(null, customFile);
};

export const fileFilter = (req, file, callback) => {
  if (file) {
    if (!file.originalname.match(/\.(csv)$/)) {
      return callback(new Error('Wrong extension of file'), false);
    }
  }
  callback(null, true);
};
