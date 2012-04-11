
/*
if typeof require is "function" and typeof module is "object"
  buster = require("buster")
  require "./strftime"
*/

(function() {

  require([], function() {
    var assert;
    assert = buster.assert;
    return buster.testCase("Date strftime tests", {
      setUp: function() {
        return this.date = new Date(2009, 11, 5);
      },
      "%Y": {
        setUp: function() {
          return this.year = this.date.strftime("%Y");
        },
        "should return full year": function() {
          return assert.equals(this.year, "2009");
        },
        "should return a string": function() {
          return assert.equals(typeof this.year, "string");
        }
      },
      "%y should return two digit year": function() {
        return assert.equals(this.date.strftime("%y"), "09");
      },
      "%m should return month": function() {
        return assert.equals(this.date.strftime("%m"), "12");
      },
      "%d should return date": function() {
        return assert.equals(this.date.strftime("%d"), "05");
      },
      "//%j should return the day of the year": function() {
        var date;
        date = new Date(2011, 0, 1);
        return assert.equals(date.strftime("%j"), 1);
      }
    });
  });

}).call(this);
