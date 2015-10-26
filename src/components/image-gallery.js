import React, { Component, PropTypes } from 'react';
import AddImageObject from './add-image-object';
import ImageObject from './image-object';

export default class ImageGallery extends Component {
  constructor(props) {
    super(props);
    this.state = {docs: props.docs};
  }

  componentDidMount() {
    this.changes = this.props.db.changes({
      since: 'now',
      live: true,
      include_docs: true
    }).on('change', (change) => {
      let { doc } = change;
      Promise.resolve().then(() => {
        if (!doc.thumbnail.url) {
          return db.getAttachment(doc['@id'], doc.thumbnail.alternateName).then(blob => {
            doc.thumbnail.url = URL.createObjectURL(blob);
            return doc;
          });
        } else {
          return doc;
        }
      }).then(doc => {
        for (var i = 0 ; i < this.state.docs.length; i++) {
          if (this.state.docs[i]['@id'] === doc['@id']) {
            break;
          }
        }
        if (i === this.state.docs.length) {
          this.setState({docs: this.state.docs.concat(doc)});
        } else {
          let docs = this.state.docs.slice();
          docs[i] = doc;
          this.setState({docs});
        }
      });
    }).on('error', (err) => {
      console.error(err);
    });
  }

  componentWillUnmount() {
    this.changes.cancel();
  }

  handleDestroy(e) {
    e.preventDefault();
    this.changes.cancel();
    this.props.db.destroy().then(res => {
      this.setState({docs: []}, () => {
        window.location = '/';
      });
    }).catch(err => {
      console.error(err);
    });
  }

  render() {
    return (
      <div className='image-gallery' vocab="http://schema.org/" typeof="ImageGallery">
        <h1 property="name">Image Gallery</h1>
        <button onClick={this.handleDestroy.bind(this)}>destroy DB</button>

        <ul>
        {this.state.docs.map(doc => (
          <li key={doc['@id']} typeof="ImageObject">
           <ImageObject db={this.props.db} doc={doc} />
          </li>
        ))}
        </ul>
        <AddImageObject db={this.props.db}/>
      </div>
    );
  }
}
