'use strict';

var DependencyFactory = require('DependencyFactory'),

    Collection = require('mvc/Collection'),
    CollectionSelectBox = require('mvc/CollectionSelectBox'),
    SelectedCollectionView = require('mvc/SelectedCollectionView'),

    Util = require('util/Util');

/**
 * Displays a collection of site classes in a collection select box,
 * The collection of site classes updates when the selected analysis
 * in the collection of analyses changes.
 *
 * SiteClassView({
 *   el: document.createElement('div'),
 *   editions: Collection([SiteClass]),
 *   collection: Collection([Analysis])
 * });
 *
 * @param {[type]} params [description]
 */
var SiteClassView = function (params) {

  var _this,
      _initialize,

      _dependencyFactory,
      _destroyDependencyFactory,
      _destroySiteClassCollection,
      _selectSiteClass,
      _siteClassCollection,
      _siteClassCollectionSelectBox,

      _updateSiteClass,
      _updateSiteClassCollectionSelectBox;

  _this = SelectedCollectionView(params);

  /**
   * @constructor
   */
  _initialize = function (params) {

    // site class collection
    if (params.vs30) {
      _siteClassCollection = params.vs30;
      _destroySiteClassCollection = false;
    } else {
      _siteClassCollection = Collection();
      _destroySiteClassCollection = true;
    }

    // site class CollectionSelectBox
    _siteClassCollectionSelectBox = CollectionSelectBox({
      collection: _siteClassCollection,
      el: _this.el,
      includeBlankOption: true,
      format: function (model) {
        return model.get('display');
      }
    });

    // bind to select on the Site Class collection
    _siteClassCollection.on('select', _updateSiteClass);
    _siteClassCollection.on('deselect', _updateSiteClass);

    // get an instance of the dependency factory
    if (params.factory) {
      _dependencyFactory = params.factory;
      _destroyDependencyFactory = false;
    } else {
      _dependencyFactory = DependencyFactory.getInstance();
      _destroyDependencyFactory = true;
    }

    // update/select the site class in the currently selected Analysis
    _dependencyFactory.whenReady(function () {
      _updateSiteClassCollectionSelectBox();
      _this.render();
    });
  };

  /**
   * update the currently selected Analysis model with
   * the currently selected Site Class in the CollectionSelectBox.
   */
  _updateSiteClass = function () {
    if (_this.model) {
      _this.model.set(
        {'vs30': _siteClassCollection.getSelected()}
      );
    }
  };

  /**
   * Update the site class options in the select box based on
   * the location and edition.
   */
  _updateSiteClassCollectionSelectBox = function () {
    var edition,
        location,
        siteClasses;

    siteClasses = _dependencyFactory.getAllSiteClasses();

    if (_this.model) {
      edition = _this.model.get('edition');
      location = _this.model.get('location');

      // check on requisite params for filtering
      if (edition && location) {
        siteClasses = _dependencyFactory.getFilteredSiteClasses(
            edition.get('id'), location.latitude, location.longitude);
      }
    }

    // reset site class collection with site classes
    _siteClassCollection.reset(siteClasses);
  };

  /**
   * unset the event bindings for the collection
   */
  _this.onCollectionDeselect = function () {
    _this.model.off('change', 'render', _this);
    _this.model = null;
    _updateSiteClassCollectionSelectBox();
    _this.render();
  };

  /**
   * set event bindings for the collection
   */
  _this.onCollectionSelect = function () {
    _this.model = _this.collection.getSelected();
    _updateSiteClassCollectionSelectBox();
    _this.model.on('change', 'render', _this);
    _this.render();
  };

  /**
   * Calls CollectionSelectBox.destroy() and cleans up local variables
   */
  _this.destroy = Util.compose(function () {
    // unbind
    _siteClassCollection.off('select', _updateSiteClass);
    _siteClassCollection.off('deselect', _updateSiteClass);
    // destroy
    if (_destroySiteClassCollection) {
      _siteClassCollection.destroy();
    }
    if (_destroyDependencyFactory) {
      _dependencyFactory.destroy();
    }
    _siteClassCollectionSelectBox.destroy();
    // methods
    _updateSiteClass = null;
    // variables
    _dependencyFactory = null;
    _destroyDependencyFactory = null;
    _destroySiteClassCollection = null;
    _selectSiteClass = null;
    _siteClassCollection = null;
    _siteClassCollectionSelectBox = null;
    _this = null;
    _initialize = null;
  }, _this.destroy);


  /**
   * render the selected site class, or the blank option
   */
  _this.render = function (changes) {
    var siteClass;

    // update the site class collection before selecting
    if (typeof changes !== 'undefined' && (
        changes.hasOwnProperty('location') ||
        changes.hasOwnProperty('edition'))) {
      _updateSiteClassCollectionSelectBox();
    } else {
      // Update selected site class when collection changes
      if (_this.model) {
        siteClass = _this.model.get('vs30');
        if (siteClass === null) {
          _siteClassCollection.deselect();
        } else {
          _siteClassCollection.selectById(siteClass.id);
        }
      } else {
        // no item in the collection has been selected
        _siteClassCollection.deselect();
      }
    }
  };

  _initialize(params);
  params = null;
  return _this;

};

module.exports = SiteClassView;
