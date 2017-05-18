/**
 * @author Dmitriy Bizyaev
 */

'use strict';

export default {
  displayName: 'optgroup',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  group: 'forms',
  props: {
    disabled: {
      textKey: 'props_disabled',
      descriptionTextKey: 'props_disabled_desc',
      required: false,
      type: 'bool',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: false,
        },
        data: {},
      },
    },
    label: {
      textKey: 'props_label',
      descriptionTextKey: 'props_label_desc',
      required: false,
      type: 'string',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: '',
        },
        data: {},
      },
    },
  },
  propGroups: [],
  strings: {
    name: {
      en: '<optgroup> tag',
    },
    description: {
      en: '',
    },
    props_disabled: {
      en: 'disabled',
    },
    props_disabled_desc: {
      en: '',
    },
    props_label: {
      en: 'label',
    },
    props_label_desc: {
      en: '',
    },
  },
  tags: new Set(),
  placement: {
    inside: {
      include: [
        { component: 'select' },
      ],
    },
  },
};
