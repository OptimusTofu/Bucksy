const isImage = function (attachment) {
  const imgURL = attachment.url;
  const extensions = [".jpg", ".jpeg", ".png"];
  const extension = imgURL.substring(imgURL.lastIndexOf("."), imgURL.length);

  return extensions.indexOf(extension) >= 0;
};

module.exports = {
  isImage,
};
