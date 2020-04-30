export const UTIL = {
  mandatoryAttribute() {
    throw new Error('Attribute is mandatory');
  },

  isNumber(value) {
    return value !== '' && !isNaN(value);
  },
};
