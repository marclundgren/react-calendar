/**
 * @jsx React.DOM
 */

// app namespace
var app = app || {};

app.CalendarDate = React.createClass({
  onClick: function() {
    // console.log('hello there!');
    // this.props.events
    console.log('this.props.events: ', this.props.events);
  },

  render: function() {
    return (
      <div className={this.props.className} onClick={this.props.onClick}>
        <div className='date-number'>{this.props.moment.date()}</div>
      </div>
    );
  }
});