/**
 * @author Dmitriy Bizyaev
 */

'use strict';

export default {
  displayName: 'map',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  group: 'media',
  props: {
    name: {
      textKey: 'props_name',
      descriptionTextKey: 'props_name_desc',
      required: true,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
  },
  propGroups: [],
  strings: {
    name: {
      en: '<map> tag',
    },
    description: {
      en: '',
    },
    props_name: {
      en: 'name',
    },
    props_name_desc: {
      en: '',
    },
  },
  tags: new Set(),
};
