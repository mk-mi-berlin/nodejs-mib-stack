var PrismicDOM = require('prismic-dom');
var Elements = PrismicDOM.RichText.Elements;

  module.exports = {

  apiEndpoint: 'https://hackaton.cdn.prismic.io/api/v2',
  //https://kaemidemo2.prismic.io/api/v2',

  // -- Access token if the Master is not open
  // accessToken: 'xxxxxx',

  // OAuth
  // clientId: 'xxxxxx',
  // clientSecret: 'xxxxxx',

  // -- Links resolution rules
  // This function will be used to generate links to Prismic.io documents
  // As your project grows, you should update this function according to your routes
  linkResolver: function(doc, ctx) {
    if (doc.type == 'page') {
        return '/' + doc.uid;
    }
    if (doc.type == 'map-page') {
        return '/map/' + doc.uid;
    }
    
    
    if (doc.type == 'kaemi-page') {
        return '/kaemi-page/' + doc.uid;
    }
    return '/';
  },

  htmlSerializer: function (type, element, content, children) {
    //console.log("htmlSerializer m1.1.2");
    //console.dir(type.type);
    /*var t = type.type;
    if(t == 'hyperlink') {
      console.log("hyperlink:");
      var linkUrl = PrismicDOM.Link.url(element.data, linkResolver);
      var target = "";
      console.log("linkurl: " + linkUrl);
      return '<a class="some-link"' + target + ' href="' + linkUrl + '"><h1>mk1</h1> ' + content + '</a>';
    }
  */
      return null;
  

  },
};
