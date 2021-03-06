// CalendarGridBodyView.js
// --------
define(['react', 'underscore.guid', 'backbone', 'views/CalendarGridBodyRowView'],
  function(React, _, Backbone, CalendarGridBodyRowView) {

    var CalendarGridBodyView = React.createClass({displayName: 'CalendarGridBodyView',
      getDefaultProps: function() {
        return {
          events: [],
          dates: [],
          weekLength: 7,
          className: 'week-body',

          onGridSelect: function() {}
        };
      },

      createWeek: function(item) {
        return (
          CalendarGridBodyRowView({
            dates: item,
            key: _.guid(),
            onGridSelect: this.props.onGridSelect
          })
        );
      },

      weeks: function() {
        var weeks = [];

        var dates = this.props.dates;

        var weeksInMonth = (dates.length / this.props.weekLength);

        var daysOfMonthCollection = new Backbone.Collection(dates);

        for (var index = 0; index < weeksInMonth; index++) {
          weeks[index] = daysOfMonthCollection.where({week: index + 1});
        }

        return weeks;
      },

      render: function() {
        var weeks = this.weeks();

        return (
          React.DOM.div({className: this.props.className},
            weeks.map(this.createWeek)
          )
        );
      }
    });

    return CalendarGridBodyView;
  }
);