/**
 * @jsx React.DOM
 */

// namespace
var app = app || {};

Backbone.MultiCalendar = Backbone.Model.extend({
  defaults: {
    calendar: '',
    date: moment(),
    router: new Backbone.CalendarRouter(),
    sources: new Backbone.Collection([])
  },

  initialize: function() {
    this._initSources();
    this._initEvents();
    this._initCalendars();
    this._bindRoutes();
  },

  _initSources: function() {
    var self = this;
    var sources = this.get('sources');

    if (!(sources instanceof Backbone.Collection)) {
      sources = new Backbone.Sources(sources);
    }

    this.set('sources', sources);

    this.listenTo(sources, 'change', function() {
      var sources = self.get('sources');

      self._syncCalendars();

      self.dateView();
    });

    // this.fetchGoogleCalendars();
  },

  _syncCalendars: function() {
    var calendars = this.getCalendars();

      this.set('calendars', calendars);
  },

  _initEvents: function() {
    var events = this.get('sources').pluck('events');

    var flattenedEvents = _.flatten(events);

    this.set('events', new Backbone.Collection(flattenedEvents));
  },

  fetchGoogleCalendars: function() {
    var sources = this.get('sources');

    var sourcesRemote = sources.filter(function (source) {
      var id = source.get('googleCalendarId');

      return id && _.isString(id);
    });

    sourcesRemote = new Backbone.Sources(sourcesRemote);

    sourcesRemote.each(function(source) {
      source.fetch().done(function(results) {
        var entries = results.feed.entry.map(function(item) {
          var sourceName = source.get('name');
          return {
            author:       item.author[0].name,
            calendar:     source.get('name'),
            content:      item.content.$t,
            date:         item.gd$when[0].startTime,
            endTime:      item.gd$when[0].endTime,
            id:           item.gCal$uid.value,
            link:         item.link[0].href,
            location:     item.gd$where[0].valueString,
            startTime:    item.gd$when[0].startTime,
            title:        item.title.$t,
            updated:      item.updated.$t
          };
        });

        var events = new Backbone.CalendarEvents(entries);

        sources.get(source).set('events', events.toJSON());

        // consume the calendarId
        source.set('googleCalendarId', null);
      });
    });
  },

  _initCalendars: function() {
    this._syncCalendars();
  },

  getCalendars: function() {
    return _.flatten(['all', this.get('sources').pluck('name')]);
  },

  _bindRoutes: function() {
    var self = this;

    var router = this.get('router');

    this.listenTo(router, 'route:calendar', function() {
      self.calendar.apply(self, arguments);
    });

    this.listenTo(router, 'route:today', function() {
      self.today.apply(self, arguments);
    });

    this.listenTo(router, 'route:date', function() {
      self.date.apply(self, arguments);
    });

    this.listenTo(router, 'route:event', function() {
      self.event.apply(self, arguments);
    });

    Backbone.history.start();
  },

  getEventById: function(id) {
    var events = this.getEvents();

    return events.findWhere({id: id});
  },

  getEventsByCalendar: function(calendar) {
    if (calendar == 'all') {
      return this.getEvents();
    }
    else {
      var sources = this.get('sources').where({name: calendar});

      sources = new Backbone.Collection(sources);

      return sources && new Backbone.Collection(_.flatten(sources.pluck('events'))) || [];
    }
  },

  getEvents: function() {
    var sourceEvents = this.get('sources').map(function(source) {
      var sourceEvents = source.get('events');

      sourceEvents = sourceEvents.map(function(item) {
        item.calendar = source.get('name');
      });

      return source.get('events');
    });

    var events = _.flatten(sourceEvents);

    events = new Backbone.CalendarEvents(events);

    return events || [];
  },

  date: function(date, id, cat) {
    date = moment(date) || moment()

    if (id) {
      this.eventView(id, date);
    }
    else {
      this.fetchGoogleCalendars();

      this.dateView(date, cat);
    }
  },

  eventView: function(id, date) {
    var self = this;

    var calendarEvent = this.getEventById(id);
    var router = this.get('router');
    var mountPoint = this.get('mountPoint');

    if (calendarEvent) {
      React.renderComponent(
        app.EventView({
          model: calendarEvent,
          router: router
        }),
        mountPoint
      );
    }
    else {
      var sources = this.get('sources');

      if (sources) {
        if (!sources.fetched) {
          sources.fetched = true;

          this.fetchGoogleCalendars();

          sources.off('change');

          sources.on('change', function() {
            calendarEvent = self.getEventById(id);

            if (calendarEvent) {
              React.renderComponent(
                app.EventView({
                  model: calendarEvent,
                  router: router
                }),
                mountPoint
              );
            }
          });
        }
      }
    }
  },

  dateView: function(date, cat) {
    var cat = this.cat;

    var multiCalendarView = app.MultiCalendarView({
      model: this,
      calendar: cat,
      router: this.get('router')
    });

    React.renderComponent(multiCalendarView, document.getElementById('calendarView'));
  },

  today: function(cat) {
    this.date(moment(), null, cat);
  },

  calendar: function() {
    this.today.apply(this, arguments);
  },

  calendar: function(cat, date) {
    this.cat = cat

    if (date) {
      this.date(date, null, cat)
    }
    else {
      this.today(cat);
    }
  },

  event: function(cat, id) {
    this.date(cat, id);
  }
});