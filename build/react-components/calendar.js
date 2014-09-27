/** @jsx React.DOM */

// app namespace
var app = app || {};

app.CalendarDayEvents = React.createClass({displayName: 'CalendarDayEvents',
  getInitialState: function() {
    return {
      collection: []
    };
  },

  getDefaultProps: function() {
    return {
      title: 'Detailed View'
    };
  },

  createEvent: function(item) {
    return (
      React.DOM.div({className: "event"}, 
        React.DOM.h4({className: "event-title"}, 
          React.DOM.a({href: item.get('link')}, item.get('title'))
        ), 

        React.DOM.div({className: "when"}, 
          React.DOM.div({className: "starts"}, 
            "Starts: ", item.starts()
          ), 
          React.DOM.div({className: "duration"}, 
            "Duration: ", item.duration()
          )
        ), 
        React.DOM.div({className: "where"}, 
          "Location: ", item.get('location')
        ), 

        React.DOM.div({className: "content"}, 
          React.DOM.div(null, item.get('content'))
        )
      )
    );
  },

  render: function() {
    var events;

    if (this.state.collection.length) {
      events = this.state.collection.map(this.createEvent);
    }
    else {
      events = 'There are no events.';
    }

    return (
      React.DOM.div({className: "selected-events-list"}, 
        React.DOM.div({className: "selected-events-list-header"}, 
          React.DOM.h3({className: "title"}, this.props.title)
        ), 
        events
      )
    );
  }
});

app.Calendar = React.createClass({displayName: 'Calendar',
  getDefaultProps: function() {
    return {
      classNameGrid:      'col-xs-12 col-sm-6  col-md-4 col-lg-6',
      classNameDayEvents: 'col-xs-12 col-sm-6  col-md-4 col-lg-3',
      classNameEventList: 'col-xs-12 col-sm-12 col-md-4 col-lg-3',
      debounceDelay: 800,
      params: {},
      sources: []
    };
  },

  getInitialState: function() {
    return {
      activeDayEvents: new Backbone.Collection(),
      collection: new Backbone.GoogleEvents([]),
      date: moment(new Date())
    };
  },

  componentWillMount: function() {
    this.setState({date: moment(this.state.date)});
  },

  componentDidMount: function() {
    var self = this;

    var googleCalendar = new Backbone.GoogleCalendar({
      params: this.props.params,
      sources: this.props.sources
    });

    googleCalendar.get('entries').on('add', _.debounce(function(event) {
      self.updateCalendarComponents(googleCalendar);
    }), this.props.debounceDelay);

    googleCalendar.fetchSources();

    // googleCalendar.fetchSources().done(function(results) {
    //   console.log('fetch all sources complete');

    //   var collection = googleCalendar.get('entries');

    //   // 99% sure this is not needed...
    //   self.setState({collection: collection});

    //   self.refs.calendarGrid.setState({collection: collection});
    //   self.refs.calendarEventList.setState({collection: collection});

    //   var dateEvents = collection.where({
    //     yearMonthDay: moment(self.state.date).format('YYYY-MM-DD')
    //   });

    //   self.refs.calendarDayEvents.setState({collection: dateEvents});
    // });
  },

  updateCalendarComponents: function(calendar) {
    var collection = calendar.get('entries');

    // 99% sure this is not needed...
    this.setState({collection: collection});

    this.refs.calendarGrid.setState({collection: collection});
    this.refs.calendarEventList.setState({collection: collection});

    var dateEvents = collection.where({
      yearMonthDay: moment(this.state.date).format('YYYY-MM-DD')
    });

    this.refs.calendarDayEvents.setState({collection: dateEvents});
  },

  onGridSelect: function(cell) {
    this.setState({date: cell.props.date});

    this.refs.calendarDayEvents.setState({collection: cell.props.events});
  },

  onChange: function(event) {
    var self = this;

    var vals = $(event.currentTarget).val();

    var filteredEvents = vals.map(function(name) {
      return self.state.collection.where({calendarName: name})
    });

    var flatFilteredEvents = _.flatten(filteredEvents);

    this.refs.calendarGrid.setState({collection: flatFilteredEvents});
    this.refs.calendarEventList.setState({collection: flatFilteredEvents});

    flatFilteredEvents = new Backbone.Collection(flatFilteredEvents);

    var dateEvents = flatFilteredEvents.where({
      yearMonthDay: moment(self.state.date).format('YYYY-MM-DD')
    });

    self.refs.calendarDayEvents.setState({collection: dateEvents});
  },

  next: function() {
    this.setState({date: this.state.date.add(1, 'month')});
  },

  prev: function() {
    this.setState({date: this.state.date.subtract(1, 'month')});
  },

  createOption: function(item) {
    return app.CalendarSourceOption({name: item.name});
  },

  render: function() {
    var sources = new Backbone.Collection(this.props.sources);

    var names = sources.pluck('name');

    var yearMonthDay = this.state.date.format('YYYY-MM-DD');

    var title = this.state.date.format('MMMM DD') + ' Events';

    return (
      React.DOM.div({className: "container-fluid"}, 
        React.DOM.div({className: "row"}, 
          React.DOM.div({className: "col-md-12"}, 
            React.DOM.div({className: "calendar-source-filter"}, 
              React.DOM.select({multiple: true, name: "source-filter", id: "calendarSourceFilter", onChange: this.onChange, defaultValue: names}, 
                this.props.sources.map(this.createOption)
              )
            )
          )
        ), 

        React.DOM.div({className: "row"}, 
          React.DOM.div({className: this.props.classNameGrid}, 
            React.DOM.div({className: "calendar"}, 
              app.CalendarControls({date: this.state.date, onPrev: this.prev, onNext: this.next}), 

              app.CalendarGrid({
                onGridSelect: this.onGridSelect, 
                date: this.state.date, 
                collection: this.props.collection, 
                ref: "calendarGrid"})
            )
          ), 

          React.DOM.div({className: this.props.classNameDayEvents}, 
            app.CalendarDayEvents({title: title, collection: this.state.activeDayEvents, ref: "calendarDayEvents"})
          ), 

          React.DOM.div({className: this.props.classNameEventList}, 
            app.CalendarEventList({
              collection: this.props.collection, 
              ref: "calendarEventList"})
          )
        )
      )
    );
  }
});