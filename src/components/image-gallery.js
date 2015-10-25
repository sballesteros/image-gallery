import PouchDB from 'pouchdb';
import React, { Component, PropTypes } from 'react';

export default class ImageGallery extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='image-gallery' typeof="ImageGallery">
        <h1>Image Gallery</h1>
      </div>
    );
  }
}
