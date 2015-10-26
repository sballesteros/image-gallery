import React, { Component, PropTypes } from 'react';

const ENTER_KEY_CODE = 13;

export default class ImageObject extends Component {

  handleBlur(prop, e) {
    e.preventDefault();
    let { doc, db } = this.props;
    let value = e.target.value;

    if (doc[prop] !== value) {
      db.upsert(doc['@id'], (doc) => {
        doc[prop] = value;
        return doc;
      }).catch(err => {
        console.error(err);
      });
    }
  }

  handleKeyDown(prop, e) {
    if (e.keyCode === ENTER_KEY_CODE) {
      this.handleBlur(prop, e);
    }
  }

  render() {
    let { doc } = this.props;
    return (
      <figure typeof="ImageObject">
        <img property="contentUrl" src={doc.thumbnail.url}/>
        <figcaption>
          <input
           property="name"
           defaultValue={doc.name}
           onKeyDown={this.handleKeyDown.bind(this, 'name')}
           onBlur={this.handleBlur.bind(this, 'name')}
          />
          <span property="alternateName">{doc.alternateName}</span>
          <textarea
           property="caption"
           defaultValue={doc.caption}
           onBlur={this.handleBlur.bind(this, 'caption')}
          />
        </figcaption>
      </figure>
    );
  }

}
