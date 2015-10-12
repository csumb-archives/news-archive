var fs = require('fs'),
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
var walker = walk.walk('.', { followLinks : false });
walker.on("file", function(root, fileStat, next) {
  if(fileStat.name.search('.html') > -1) {
    fs.readFile(path.resolve(root, fileStat.name), function (err, data) {
      if(!err) {
        tidy(data, function(err, html) {
          $ = cheerio.load(html);
          var title = $('h1.title').first().html();
          if(title) {
            title = title.replace(/:/g, '&#58;').replace(/\//g, ' ').replace(/~/g, '-').replace(/\n/g, ' ').replace(/-/g, '').trim();
          }
          var $byline = $('.news-byline');
          $byline.find('a').remove();
          page = {
            title : title,
            content : $('#content').first().html(),
            date : $byline.html().replace('Posted on ', '')
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
