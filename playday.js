// here we declare our Playday class in what has become the defacto way
// if this were an NPM module, we would be using require and module.exports
(function(){
  // jquery makes this simpler (react, angular, etc. would be overkill)
  var $ = window.jQuery;

  // our constructor, we don't do any real work here but we
  // init the settings and DOM node references we'll need later
  var Playday = function(options) {
    options       = options       || {};
    nodes         = options.nodes || {};
    this.baseUrl  = options.baseUrl;
    this.username = options.username;
    this.password = options.password;
    this.videos   = [],

    // having node references decouples us from the markup
    this.nodes = {
      screen:   $(nodes.screen),
      playlist: $(nodes.playlist),
      title:    $(nodes.title),
      desc:     $(nodes.desc),
      error:    $(nodes.error),
      prev:     $(nodes.prev),
      next:     $(nodes.next),
      what:     $(nodes.what)
    };
  }

  Playday.prototype.load = function() {
    // wire up prev/next/what buttons
    // note how we use bind() to ensure instance scope
    var nodes = this.nodes;
    nodes.prev.click(this.prev.bind(this));
    nodes.next.click(this.next.bind(this));
    nodes.what.click(this.toggleWhat.bind(this));

    // fetch the videos from mediacore (this is the only request we make)
    // when the data comes back, hang onto it, build a playlist and autoplay
    this.getVideos().success(function(data) {
      this.videos = data.items;
      this.renderPlaylist();
      this.play(0);
    }.bind(this));
  }

  // get the videos, we use joins to get everything we need in one call
  // note: we craft the basic-auth header manually because jQuery's
  // username/password fields don't appear to work with CORS
  Playday.prototype.getVideos = function() {
    return $.get({
      url:        this.baseUrl + 'media',
      data:       {type: 'video', joins: 'thumbs,embedcode'},
      beforeSend: function(xhr) {
        xhr.setRequestHeader(
          'Authorization',
          'Basic ' + btoa(this.username + ':' + this.password)
        );
      }.bind(this),
    }).fail(function(xhr){
      this.nodes.error.text('Failed to get videos: ' + xhr.statusText).show();
    }.bind(this));
  }

  // populate the playlist node with videos
  // each video gets a thumbnail, a title and plays when clicked
  Playday.prototype.renderPlaylist = function() {
    this.nodes.playlist.empty();

    for (i in this.videos) {
      // these deep references are fragile, so we try/catch them
      // skipping over any bad entries and logging the errors
      try {
        var title = this.videos[i].title;
        var src   = this.videos[i].joins.thumbs.sizes.l;
      } catch (e) {
        console.log(e);
        continue;
      }

      // note how we pass the video index through the click event so we can
      // use bind and have instance scope (otherwise 'this' would be our thumb)
      var thumb = $('<div></div>')
        .click(i, function(e) { this.play(parseInt(e.data, 10)); }.bind(this))
        .addClass('thumb')
        .append($('<img>').attr('src', src))
        .append($('<div></div>').text(title))
        .appendTo(this.nodes.playlist);
    }
  }

  // play the specified video using playerjs
  Playday.prototype.play = function(index) {
    this.current = index;
    var video    = this.videos[index]
    var nodes    = this.nodes;

    // playerjs takes an iframe, start by applying the embedcode to our 'screen'
    // then hand it off to playerjs (this is the only place we touch playerjs)
    nodes.screen.html(video.joins.embedcode.html);
    var player = new playerjs.Player(nodes.screen.find('iframe')[0]);
    player.on('ready', function() { player.play(); });
    player.on('ended', function() { this.next(); }.bind(this));

    // update the other parts of our interface (title, desc, playlist)
    nodes.title.text(video.title);
    nodes.desc.text(video.description_plain);
    nodes.playlist.find('.thumb.selected').removeClass('selected');
    nodes.playlist.find('.thumb').eq(index).addClass('selected');
  }

  Playday.prototype.prev = function() {
    this.play(
      this.current > 0
        ? this.current - 1
        : this.videos.length - 1
    );
  }

  Playday.prototype.next = function() {
    this.play(
      this.current < this.videos.length - 1
        ? this.current + 1
        : 0
    );
  }

  // ...felt like doing something silly
  // this toggles on/off a bizarre filtering effect
  Playday.prototype.toggleWhat = function() {
    if (!this.interval) {
      this.cycle    = 0;
      this.interval = window.setInterval(this.what.bind(this), 250);
    } else {
      window.clearInterval(this.interval);
      this.interval = null;
      this.nodes.screen.css({
        'filter':         'none',
        '-webkit-filter': 'none'
      });
    }
  }

  // apply css filters to produce a strange inverted video
  Playday.prototype.what = function() {
    var odd     = this.cycle++ % 2;
    var filters = [
      'invert('     + (odd ? '90' : '100')  + '%)',
      'contrast('   + this.random(100, 200) + '%)',
      'saturate('   + this.random(50, 150)  + '%)',
      'brightness(' + this.random(100, 150) + '%)',
      'hue-rotate(' + this.random(0, 360)   + 'deg)'
    ];
    this.nodes.screen.css({
      'filter':         filters.join(' '),
      '-webkit-filter': filters.join(' ')
    });
  }

  // produce a random integer between min/max inclusive
  Playday.prototype.random = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // export our 'module'
  window.Playday = Playday;
})();
