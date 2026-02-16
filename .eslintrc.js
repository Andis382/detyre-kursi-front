module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    "no-unused-vars": "off",
    "no-unused-components": "off",
    "vue/no-unused-vars": "off",
    "vue/no-unused-components": "off",
  },
};
