import { Registry } from '@spinnaker/core';
//
// // fetch('./settings-plugins.js')
// //   .then(function(response) {
// //     return response.json();
// //   })
// //   .then(function(data) {
// //     data.plugins.forEach(plugin => {
// //       // var script = document.createElement('script');
// //       // script.src = plugin.location;
// //       // var body = document.getElementsByTagName('body')[0];
// //       // body.append(script);
// //     });
// //   });
//
//       // require.config({
//       //   // baseUrl: './'
//       //   paths: {
//       //     mystage: '//localhost:8000/plugins-ui/mystage/dist/index.js'
//       //   },
//       //   shim: {
//       //     mystage: {
//       //       exports: 'Poop'
//       //     }
//       //   }
//       // });
//

requirejs.config({
  paths: {
    mystage: '//localhost:8000/plugins-ui/mystage/dist/index.js',
  },
});

require(['mystage'], function(p) {
  p.stuff(Registry);
});
