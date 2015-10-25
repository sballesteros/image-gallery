require('babel/polyfill');

import React from 'react';
import ReactDOM from 'react-dom';
import ImageGallery from './components/image-gallery';

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<ImageGallery/>, document.getElementById('app'));
});
