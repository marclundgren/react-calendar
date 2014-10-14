/**
 * @jsx React.DOM
 */

// namespace
var app = app || {};

app.CalendarItemOptionView = React.createClass({
  getDefaultProps: function() {
    return {
      selected: false
    };
  },

  render: function() {
    return (
      <option value={this.props.name} selected={this.props.selected}>{this.props.name}</option>
    );
  }
});

app.CalendarItemView = React.createClass({
  getDefaultProps: function() {
    return {
      className: 'calendar-view',
      selected: false
    };
  },

  onClick: function() {
    this.props.changeCalendar(this.props.name);
  },

  render: function() {
    var className = this.props.className;

    if (this.props.selected) {
      className += ' selected';
    }

    return (
      <div className={className} onClick={this.onClick}>
        <div>{this.props.name}</div>
      </div>
    );
  }
});