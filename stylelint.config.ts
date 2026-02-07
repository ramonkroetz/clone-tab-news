import { propertyGroups } from 'stylelint-config-clean-order'

const propertiesOrder = propertyGroups.map((properties) => ({
  noEmptyLineBetween: true,
  emptyLineBefore: 'never',
  properties,
}))

const config = {
  extends: ['stylelint-config-clean-order'],
  ignoreFiles: ['dist/**'],
  rules: {
    'order/properties-order': [
      propertiesOrder,
      {
        severity: 'error',
        unspecified: 'bottomAlphabetical',
      },
    ],
  },
}

export default config
