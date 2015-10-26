require('babel/polyfill');

import React from 'react';
import ReactDOM from 'react-dom';
import ImageGallery from './components/image-gallery';
import PouchDB from 'pouchdb';
import pouchdbUpsert from 'pouchdb-upsert';
import history from './history';

PouchDB.plugin(pouchdbUpsert);


var db = window.db = new PouchDB('image-gallery', { auto_compaction: true });

document.addEventListener('DOMContentLoaded', () => {

  history.listen(location => {

    let p;
    if (location.query.root) {
      p = db.get(location.query.root).catch(err => {
        console.error(err);
        return db.get('root').then(doc => db.get(doc.root));
      });
    } else {
      p = db.get('root').then(doc => {
        console.log('rrrrr', doc);
        return db.get(doc.root)
      });
    }

    p.catch(err => {
      console.error(err);
    }).then(root => {
      console.log('root', root);
      ReactDOM.render(
        <ImageGallery db={db} root={root} history={history}/>,
        document.getElementById('app')
      );
    });

  })(); // immediately unlisten;

});
