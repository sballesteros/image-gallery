import React, { Component, PropTypes } from 'react';
import blobUtil from 'blob-util';
import uuid from 'uuid';

export default class AddImageObject extends Component {

  handleChange(e) {
    // see http://stackoverflow.com/questions/10214947/upload-files-using-input-type-file-field-with-change-event-not-always-firin
    if (!e.target.value) return;

    resizeImage(e.target.files[0], {maxSize: 400}).then(data => {
      const id = uuid.v4();
      const indThumb = (data.length === 1) ? 0 : 1;

      this.props.onImage({
        _id: id,
        '@id': id,
        '@type': 'ImageObject',
        alternateName: data[0].name,
        width: data[0].width,
        height: data[0].height,
        fileFormat: data[0].type,
        contentSize: data[0].blob.size,
        contentUrl: `${id}/${data[0].name}`,
        thumbnail: {
          '@id': `${id}/${data[indThumb].name}`,
          '@type': 'ImageObject',
          alternateName: data[indThumb].name,
          width: data[indThumb].width,
          height: data[indThumb].height,
          fileFormat: data[indThumb].type,
          contentSize: data[indThumb].blob.size,
          contentUrl: `${id}/${data[indThumb].name}`,
        },
        _attachments: data.reduce((_attachments, att) => {
          _attachments[att.name] = {
            content_type: att.type,
            data: att.blob
          };
          return _attachments;
        }, {})
      });

      e.target.value = '';
    }).catch(err => {
      console.error(err);
      e.target.value = '';
    });
  }

  render() {
    return (
      <div className='add-image'>
        <input
         type='file'
         name='file'
         accept="image/png,image/jpeg"
         onChange={this.handleChange.bind(this)}
        />
      </div>
    );
  }
}


function resizeImage(file, opts) {
  return new Promise(function(resolve, reject) {
    let reader = new FileReader();
    reader.onload = function(e) {
      var img = document.createElement('img');
      img.onload = function(e) {
        const maxSize = opts.maxSize || 400
            , widthRatio = this.width / maxSize
            , heightRatio = this.height / maxSize
            , maxratio  = Math.max( widthRatio, heightRatio );

        if ( maxratio > 1 ) {
          var canvas = document.createElement("canvas");
          canvas.width = this.width / maxratio;
          canvas.height = this.height / maxratio;
          canvas.getContext("2d").drawImage(this, 0, 0, canvas.width, canvas.height);
          blobUtil.canvasToBlob(canvas, file.type).then(function(blob) {
            resolve([
              {blob: file, width: img.width, height: img.height, name: file.name, type: file.type},
              {blob: blob, width: canvas.width, height: canvas.height, name: `thumb-400-${file.name}`, type: file.type}
            ]);
          }, reject);
        } else {
          resolve([{blob: file, width: this.width, height: this.height, name: file.name, type: file.type}]);
        }
      };
      img.src = e.target.result;
    };

    reader.onerror = function(e){
      reject(this.error);
    };

    reader.readAsDataURL(file);
  });
}


AddImageObject.propTypes = {
  onImage: PropTypes.func.isRequired
};
