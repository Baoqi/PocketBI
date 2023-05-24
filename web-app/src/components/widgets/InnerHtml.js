import React from 'react';
import PropTypes from 'prop-types';

function InnerHtml(props) {
  const {
    html,
    style
  } = props;

  const markup = {
    __html: html
  }

  return (
      <div dangerouslySetInnerHTML={markup} style={style} />
  );
}

InnerHtml.propTypes = {
  html: PropTypes.string.isRequired,
  style: PropTypes.object
};

export default InnerHtml;