var config = require('./config'),
    fs = require('fs'),
    path = require('path'),
    walk = require('walk'),
    _ = require('underscore'),
    cheerio = require('cheerio'),
    tidy = require('htmltidy').tidy;
var format = ['---',
  'layout: archive',
  'title: {{title}}',
  'date: {{date}}',
  '---',
  '{{content}}'].join("\n");

var page = {};
_.each(config, function(catalog, year) {
  var walker = walk.walk(year, { followLinks : false });
  walker.on("file", function(root, fileStat, next) {
    if(fileStat.name.search('.html') > -1) {
      var outpath = path.resolve(root, fileStat.name).replace(year, 'out/' + year);
      fs.readFile(path.resolve(root, fileStat.name), function (err, data) {
        if(!err) {
          tidy(data, function(err, html) {
            $ = cheerio.load(html);
            if($('#pageheader img').length) {
              $('body').append('<h1 class="title">' + $('#pageheader img').attr('alt') + '</h1>');
            }
            $('img').remove();
            $('[bgcolor]').each(function() {
              $(this).removeAttr('bgcolor');
            });
            var title = $(catalog.title).first().html();
            if(title) {
              title = title.replace(/:/g, '&#58;').replace(/\//g, ' ').replace(/~/g, '-').replace(/\n/g, ' ').replace(/-/g, '').trim();
            }
            page = {
              title : title,
              navigation: $(catalog.navigation).first().html(),
              content : $(catalog.content).first().html(),
              longyear : catalog.longyear,
              year : year
            };
            if(page.content) {
              pageString = format;
              _.each(page, function(value, index) {
                pageString = pageString.replace('{{' + index + '}}', value);
              });
              fs.writeFile(path.resolve(root, fileStat.name), pageString, function(err) {
                console.log('Generated ' + path.resolve(root, fileStat.name));
              });

            }
          });
        }
      });
    }
    next();
  });
});
