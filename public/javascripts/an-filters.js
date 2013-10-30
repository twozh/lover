'use strict';

Date.prototype.toString = function(){
  return this.getFullYear()+'年'+(this.getMonth()+1)+'月'+
    this.getDate()+'日 '+this.getHours()+':'+this.getMinutes();
 };

/* Filters */
angular.module('loverFilters', []).filter('msgTime', function() {
  return function(time) {
    var date = new Date(time);
    return date.toString();
  };
});
