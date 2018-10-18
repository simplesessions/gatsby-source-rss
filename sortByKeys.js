import _ from 'lodash';

_.mixin({
  sortKeysBy(obj, comparator) {
    const keys = _.sortBy(_.keys(obj), key => comparator ? comparator(obj[key], key) : key);

    return _.object(keys, _.map(keys, key => obj[key]));
  }
});