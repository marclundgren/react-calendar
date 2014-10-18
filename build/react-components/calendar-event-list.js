/**
 * @jsx React.DOM
 */

// app namespace
var app = app || {};

app.CalendarEventItemByTitle = React.createClass({displayName: 'CalendarEventItemByTitle',
  getDefaultProps: function() {
    return {
      calendar: '',
      starts: '',
      subtitle: '',
      title: ''
    };
  },

  onClick: function() {
    this.props.eventLink(this.props.id);
  },

  render: function() {
    return (
      React.DOM.div({className: "row event event-fixed-height-temp-className event-by-title", onClick: this.onClick}, 
        React.DOM.div({className: "col-xs-10"}, 
          React.DOM.div({className: "row"}, 

            React.DOM.div({className: "col-xs-12 col-sm-12 col-lg-12"}, 
              React.DOM.h4({className: "titlez"}, 
                this.props.title
              )
            ), 

            React.DOM.div({className: "col-xs-12 col-sm-9 col-lg-9 location"}, 
              this.props.location
            ), 

            React.DOM.div({className: "col-xs-12 col-sm-12 col-lg-12 starts"}, 
              this.props.starts
            )
          )
        ), 

        React.DOM.div({className: "col-xs-2 arrow"}, 
          React.DOM.i({className: "glyphicon glyphicon-chevron-right"})
        )
      )
    );
  }
});

app.CalendarEventItemByDate = React.createClass({displayName: 'CalendarEventItemByDate',
  getDefaultProps: function() {
    return {
      calendar: '',
      starts: '',
      subtitle: '',
      title: ''
    };
  },

  onClick: function() {
    this.props.eventLink(this.props.id);
  },

  render: function() {
    return (
      React.DOM.div({className: "row event event-fixed-height-temp-className event-by-date", onClick: this.onClick}, 
        React.DOM.div({className: "col-xs-10"}, 
          React.DOM.div({className: "row"}, 
            React.DOM.div({className: "col-xs-12 col-sm-3 col-lg-3 starts"}, 
              this.props.starts
            ), 

            React.DOM.div({className: "col-xs-12 col-sm-9 col-lg-9"}, 
              React.DOM.h4({className: "titlez"}, 
                this.props.title
              )
            ), 

            React.DOM.div({className: "col-xs-12 col-sm-12 col-lg-12 subtitlez"}, 
              this.props.subtitle
            )
          )
        ), 

        React.DOM.div({className: "col-xs-2 arrow"}, 
          React.DOM.i({className: "glyphicon glyphicon-chevron-right"})
        )
      )
    );
  }
});

app.CalendarEventItemByLocation = React.createClass({displayName: 'CalendarEventItemByLocation',
  getDefaultProps: function() {
    return {
      calendar: '',
      location: '',
      starts: '',
      title: ''
    };
  },

  onClick: function() {
    this.props.eventLink(this.props.id);
  },

  render: function() {
    return (
      React.DOM.div({className: "row event event-fixed-height-temp-className event-by-location", onClick: this.onClick}, 
        React.DOM.div({className: "col-xs-10"}, 
          React.DOM.div({className: "row"}, 
            React.DOM.div({className: "col-xs-12 col-sm-3 col-lg-3 locationz"}, 
              this.props.location
            ), 

            React.DOM.div({className: "col-xs-12 col-sm-9 col-lg-9"}, 
              React.DOM.h4({className: "titlez"}, 
                this.props.title
              )
            ), 

            React.DOM.div({className: "col-xs-12 col-sm-12 col-lg-12 subtitlez"}, 
              this.props.starts
            )
          )
        ), 

        React.DOM.div({className: "col-xs-2 arrow"}, 
          React.DOM.i({className: "glyphicon glyphicon-chevron-right"})
        )
      )
    );
  }
});

app.CalendarEventItem = React.createBackboneClass({
  getDefaultProps: function() {
    return {
      date: null,
      duration: '',
      id: '',
      sortKey: 'startTime',
      subtitle: '',
      location: '',
      startMoment: moment(),
      starts: '',
      title: '',

      eventLink: function() {}
    };
  },

  // todo, bind a single onClick to be used by each of these items

  // onClick: function() {
  //   this.props.eventLink(this.props.id);
  // },

  render: function() {
    var sortKey = this.props.sortKey;

    var calendar = this.getModel().get('calendar');

    if (sortKey === 'startTime') {
      return app.CalendarEventItemByDate({
        calendar: calendar, 
        eventLink: this.props.eventLink, 
        id: this.props.id, 
        starts: this.props.startMoment.format('hh:mm a'), 
        subtitle: this.props.location, 
        title: this.props.title})
    }
    else if (sortKey === 'location') {
      return app.CalendarEventItemByLocation({
        calendar: calendar, 
        eventLink: this.props.eventLink, 
        id: this.props.id, 
        location: this.props.location, 
        starts: this.props.startMoment.format('hh:mm a'), 
        title: this.props.title})
    }
    else if (sortKey === 'title') {
      return app.CalendarEventItemByTitle({
        calendar: calendar, 
        eventLink: this.props.eventLink, 
        id: this.props.id, 
        location: this.props.location, 
        starts: this.props.startMoment.format('hh:mm a'), 
        title: this.props.title})
    }

    return (
      React.DOM.div(null, 
        "I did not understand that sort key."
      )
    );
  }
});

// React Component
app.CalendarEventList = React.createClass({displayName: 'CalendarEventList',
    getDefaultProps: function() {
      return {
        calendar: '',
        className: 'calendar-event-list',
        containerClassName: 'col-xs-12 col-sm-6 col-md-6 col-lg-9 event-list-container',
        events: [],
        sortable: false,
        sortTitle: 'Sort by',
        title: 'All Events'
      };
    },

    getInitialState: function() {
      return {
        sortValue: 'startTime'
      };
    },

    title: function() {
      var title;

      if (this.props.date) {
        title = this.props.date.format('MMMM DD');

        if(this.props.calendar) {
          title = this.props.calendar + ' - ' + title;
        }
      }
      else if(this.props.calendar) {
        title = this.props.calendar;
      }
      else {
        title = this.props.title;
      }

      return title;
    },

    createEntry: function (entry) {
      return (
        app.CalendarEventItem({
          calendar: this.props.calendar, 
          duration: entry.duration(), 
          eventLink: this.props.eventLink, 
          id: entry.get('id'), 
          location: entry.get('location'), 
          model: entry, 
          sortKey: this.state.sortValue, 
          startMoment: entry.startMoment(), 
          starts: entry.starts(), 
          title: entry.get('title')})
      );
    },

    onChange: function(e) {
      var val = this.refs.sortValue.getDOMNode().value;

      this.setState({sortValue: val});
    },

    selectSort: function() {
      return (
        React.DOM.div({className: "sort"}, 
          React.DOM.h5(null, this.props.sortTitle), 

          React.DOM.select({className: "form-control", ref: "sortValue", value: this.state.sortValue, name: "sortvalue", onChange: this.onChange}, 
            React.DOM.option({value: "startTime"}, "Date"), 
            React.DOM.option({value: "title"}, "Title"), 
            React.DOM.option({value: "location"}, "Location")
          )
        )
      );
    },

    render: function () {
      var sortable = this.props.sortable;

      var sortElement, sortValue;

      if (sortable && this.props.events.length) {
        sortElement = this.selectSort();

        sortValue = this.state.sortValue;
      }
      else {
        sortValue = 'startTime';
      }

      var eventsSorted = this.props.events.sortBy(sortValue);

      var noEvents;

      if (eventsSorted.length === 0) {
         noEvents = 'I could not find any events.';
      }

      return (
        React.DOM.div({className: this.props.containerClassName}, 
          React.DOM.div({className: "event-list-header"}, 
            React.DOM.h3({className: "events-title"}, this.title()), 

            sortElement
          ), 

          React.DOM.div({className: this.props.className}, eventsSorted.map(this.createEntry)), 

          React.DOM.div({className: "no-events"}, noEvents)
        )
      );
    }
});