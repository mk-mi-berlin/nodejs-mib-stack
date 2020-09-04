/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  res.render('home', {
    title: 'Home'
  });
};

exports.getIndexFrontier = (req, res) => {
  res.render('index-frontier', {
    title: "index-frontier"
  });
}

exports.getMap = (req, res) => {
	const mapid = req.params.mapid;

  res.render('map', {
    title: 'Map ' + mapid, mapid: mapid
  });
};

exports.getTicket = (req, res) => {
  res.render('ticket', {
    title: 'Ticket '
  });
};

exports.postTicket = (req, res) => {
  res.render('ticket_processed', {
  	title: req.body.ticket_title, 
  	ticket_queueid: req.body.ticket_queueid, 
  	ticket_text: req.body.ticket_text

  });
};


exports.getKaemiPage = (req, res) => {
	const uid = req.params.uid;

  // Get a page by its uid
  req.prismic.api.getByUID("kaemi-page", uid)
  .then((pageContent) => {
    if (false) {//(!req.user) {
      req.flash('message', 'not logged in');
      res.redirect('/');
    }
    if (pageContent) {
      res.render('kaemi-page', { title: 'KAEMI Page ' + uid, pageContent, uid,  user: req.user, ctx:ctx });
    } else {
      res.status(404).render('404');
    }
  })
  .catch((error) => {
    next(`error when retriving page ${error.message}`);
  });
};

exports.getForm = (req, res) => {
	const formid = req.params.formid;

	if (formid=='pfreimd') 
	  res.render('form-pfreimd', {
	    title: 'Form ' + formid, formid: formid
	  })
	
	else if (formid=='alpaca')
		res.render('form-alpaca', {
	    title: 'Form ' + formid, formid: formid
	  });
	};