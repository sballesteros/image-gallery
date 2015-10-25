import React, { Component, PropTypes } from 'react';
import AddImage from './add-image';

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
      let blob = db.getAttachment(doc['@id'], doc.thumbnail.alternateName).then(blob => {
        doc.thumbnail.url = URL.createObjectURL(blob);
        this.setState({docs: this.state.docs.concat(doc)});
      }).catch(err => {
        console.error(err);
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
      <div className='image-gallery' typeof="ImageGallery">
        <h1>Image Gallery</h1>
        <button onClick={this.handleDestroy.bind(this)}>destroy DB</button>

        <ul>
        {this.state.docs.map(doc => (
          <li key={doc['@id']}>
           <h2>{doc.alternateName}</h2>
           <img src={doc.thumbnail.url}/>
          </li>
        ))}
        </ul>
        <AddImage db={this.props.db}/>
      </div>
    );
  }
}
