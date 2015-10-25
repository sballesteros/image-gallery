require('babel/polyfill');

import React from 'react';
import ReactDOM from 'react-dom';
import ImageGallery from './components/image-gallery';
import PouchDB from 'pouchdb';

var db = window.db = new PouchDB('image-gallery', { auto_compaction: true });

document.addEventListener('DOMContentLoaded', () => {
  db.allDocs({include_docs: true, binary:true}).then(res => {
    return res.rows.map(row => row.doc);
  }).then(docs => {
    return Promise.all(docs.map(doc => db.getAttachment(doc['@id'], doc.thumbnail.alternateName))).then(blobs => {
      docs.forEach((doc, i) => {
        doc.thumbnail.url = URL.createObjectURL(blobs[i]);
      });
      return docs;
    });
  }).then(docs => {

    ReactDOM.render(
      <ImageGallery db={db} docs={docs}/>,
      document.getElementById('app')
    );

  }).catch(err => {
    console.error(err);
  });
});
