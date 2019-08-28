fetch('./settings-plugins.js')
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    data.plugins.forEach(plugin => {
      var script = document.createElement('script');
      script.src = plugin.location;
      var body = document.getElementsByTagName('body')[0];
      body.append(script);
    });
  });
