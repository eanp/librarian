tinymce.init({
  selector: '#editor',
  plugins: 'image',
  toolbar: 'undo redo | image',
  images_upload_url: '/upload',
  images_upload_handler: function (blobInfo, progress) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', blobInfo.blob(), blobInfo.filename());

      fetch('/upload', {
        method: 'POST',
        body: formData
      })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }
        return data;
      })
      .then(result => {
        resolve(result.location);
      })
      .catch(error => {
        reject(error.message || 'Upload failed');
      });
    });
  }
});

tinymce.init({
  selector: 'textarea',
  plugins: 'image',
  toolbar: 'image',
  image_dimensions: false
});