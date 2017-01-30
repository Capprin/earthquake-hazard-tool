'use strict';


var DeaggregationGraphView = require('deagg/DeaggregationGraphView'),
    DeaggResponse = require('deagg/DeaggResponse'),
    rawResponse = require('deagg/data').response[0],

    Collection = require('mvc/Collection');


var collection,
    deaggs,
    el,
    response,
    view;

el = document.querySelector('#example');

response = DeaggResponse(rawResponse);
deaggs = response.get('deaggregations').data();

collection = Collection(deaggs);
collection.select(collection.data()[0]);

view = DeaggregationGraphView({
  el: el,
  collection: collection
});


var controls,
    empty,
    reset;

controls = document.createElement('div');
el.parentNode.appendChild(controls);
controls.innerHTML = '<button class="empty">Empty</button>' +
    '<button class="reset">Reset</button>';

empty = controls.querySelector('.empty');
reset = controls.querySelector('.reset');

empty.addEventListener('click', function () {
  collection.reset([]);
});

reset.addEventListener('click', function () {
  collection.reset(deaggs);
  collection.select(collection.data()[0]);
});