import React, { Component, PropTypes } from 'react';

const ENTER_KEY_CODE = 13;

export default class ImageObject extends Component {

  constructor(props) {
    super(props);
    this.state = {imageObject: {}};
  }

  componentDidMount() {
    let { db, imageObjectId } = this.props;
    db.get(imageObjectId).then(doc => {
      return db.getAttachment(doc['@id'], doc.thumbnail.alternateName).then(blob => {
        doc.thumbnail.url = URL.createObjectURL(blob);
        return doc;
      });
    }).then(imageObject => {
      this.setState({imageObject});
    }).catch(err => {
      console.error(err);
    });
  }

  handleBlur(prop, e) {
    e.preventDefault();
    let { db } = this.props;
    let { imageObject } = this.state;
    let value = e.target.value;

    db.upsert(imageObject['@id'], (doc) => {
      if (doc[prop] !== value) {
        doc[prop] = value;
        return doc;
      }
    }).then(res => {
      console.log(res);
    }).catch(err => {
      console.error(err);
    });
  }

  handleKeyDown(prop, e) {
    if (e.keyCode === ENTER_KEY_CODE) {
      this.handleBlur(prop, e);
    }
  }

  handleChange(prop, e) {
    this.setState({imageObject: Object.assign({}, this.state.imageObject, {[prop] : e.target.value})});
  }

  render() {
    let { imageObject } = this.state;

    return (
      <figure typeof="ImageObject">
        {imageObject.thumbnail ? <img property="contentUrl" src={imageObject.thumbnail.url}/> : null}
        <figcaption>
          <input
           property="name"
           value={imageObject.name}
           onKeyDown={this.handleKeyDown.bind(this, 'name')}
           onBlur={this.handleBlur.bind(this, 'name')}
           onChange={this.handleChange.bind(this, 'name')}
          />
          <span property="alternateName">{imageObject.alternateName}</span>
          <textarea
           property="caption"
           value={imageObject.caption}
           onBlur={this.handleBlur.bind(this, 'caption')}
           onChange={this.handleChange.bind(this, 'caption')}
          />
        </figcaption>
      </figure>
    );
  }

}
