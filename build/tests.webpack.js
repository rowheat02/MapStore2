// var context = require.context('../web', true, /(-test\.jsx?)|(-test-chrome\.jsx?)$/);
var context = require.context('../web/client/plugins/ResourcesCatalog/hooks/__tests__', true, /(-test\.jsx?)|(-test-chrome\.jsx?)$/);
context.keys().forEach(context);
module.exports = context;
