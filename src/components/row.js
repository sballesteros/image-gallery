import React, { Component, PropTypes } from 'react';
import ImageObject from './image-object';
import AddImageObject from './add-image-object';

export default class Row extends Component {

  handleOnImage(imageObject) {
    let { db, doc } = this.props;

    db.put(imageObject).then(res => {
      return db.upsert(doc['@id'], doc => {
        doc.resources.push(res.id);
        return doc;
      });
    });
  }

  render() {
    return (
      <div>
        <a href={`/?root=${this.props.doc['@id']}`}>{this.props.doc['@id']}</a>

        <ul>
          {this.props.doc.resources.map(id => (
            <li key={id}>
              <ImageObject db={this.props.db} imageObjectId={id} />
            </li>
           ))}
        </ul>
        <AddImageObject onImage={this.handleOnImage.bind(this)} />

      </div>
    );
  }
}


Row.propTypes = {
  db: PropTypes.object.isRequired,
  doc: PropTypes.shape({
    '@id': PropTypes.string.isRequired,
    resources: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired
};
