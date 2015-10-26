import React, { Component, PropTypes } from 'react';
import uuid from 'uuid';
import Row from './row';

import history from '../history';

const BATCH_SIZE = 100;

export default class ImageGallery extends Component {
  constructor(props) {
    super(props);
    this.state = {docs: props.root ? [props.root] : []};
  }

  fetchNext(doc) {
    console.log('next');
    if (doc.next && (this.state.docs.length < BATCH_SIZE)) {
      this.props.db.get(doc.next).then(doc => {
        this.setState({docs: this.state.docs.concat(doc)}, () => {
          this.fetchNext(doc);
        });
      }).catch(err => {
        console.error(err);
      });
    }
  }

  componentDidMount() {
    let root = this.state.docs[0];
    if (root) {
      history.replaceState(null, '/', { root: root['@id'] });
      this.fetchNext(root);
    }

    this.changes = this.props.db.changes({
      since: 'now',
      live: true,
      include_docs: true,
      filter: function (doc) {
        return doc.type === 'row';
      }
    }).on('change', (change) => {
      let { doc } = change;
      for (var i = 0 ; i < this.state.docs.length; i++) {
        if (this.state.docs[i]['@id'] === doc['@id']) {
          break;
        }
      }
      if (i < this.state.docs.length) {
        let docs = this.state.docs.slice();
        docs[i] = doc;
        this.setState({docs});
      }
    }).on('error', (err) => {
      console.error(err);
    });
  }

  componentWillUnmount() {
    if (this.changes) {
      this.changes.cancel();
    }
  }

  handleDestroy(e) {
    e.preventDefault();
    this.props.db.destroy().then(res => {
      delete this.changes;
      this.setState({docs: []}, () => {
        window.location = '/';
      });
    }).catch(err => {
      console.error(err);
    });
  }

  handleAddRow(e) {
    e.preventDefault();
    let db = this.props.db;
    let root = this.state.docs[0];

    const id = uuid.v4();
    if (root) {
      let newRoot = {
        _id: id,
        '@id': id,
        type: 'row',
        resources: [],
        prev: null,
        next: root['@id']
      };

      db.put(newRoot).then(res => {
        if (root.prev) {
          return db.upsert(root.prev, doc => {
            doc.next = id;
          });
        }
        return res;
      }).then(res => {
        return db.upsert(root['@id'], doc => {
          doc.prev = id;
          return doc;
        });
      }).then(res => {
        return db.upsert('root', doc => {
          doc.root = id;
          return doc;
        });
      }).then(res => {
        history.replaceState(null, '/', { root: newRoot['@id'] });
        this.setState({
          docs: [newRoot, Object.assign({}, root, {prev: id})].concat(this.state.docs.slice(1))
        });
      }).catch(err => {
        console.error(err.stack);
      });

    } else {
      let docs = [
        {
          _id: 'root',
          '@id': 'root',
          root: id
        },
        {
          _id: id,
          '@id': id,
          type: 'row',
          resources: [],
          prev: null,
          next: null
        }
      ];

      db.bulkDocs(docs).then(res => {
        history.replaceState(null, '/', { root: id });
        this.setState({docs: [docs[1]]});
      }).catch(err => {
        console.error(err);
      });
    }
  }

  render() {
    return (
      <div className='image-gallery' vocab="http://schema.org/" typeof="ImageGallery">
        <h1 property="name">Image Gallery</h1>
        <button onClick={this.handleDestroy.bind(this)}>destroy DB</button>
        <button onClick={this.handleAddRow.bind(this)}>Add row</button>
        <ul>
          {this.state.docs.map(doc => (
            <li key={doc['@id']}>
              <Row db={this.props.db} doc={doc} />
            </li>
           ))}
        </ul>
      </div>
    );
  }
}


ImageGallery.propTypes = {
  root: PropTypes.object,
  db: PropTypes.object.isRequired
};
