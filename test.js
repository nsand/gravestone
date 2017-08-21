const gravestone = require('./index');
gravestone('Gene Wilder').then(data => console.log(data), err => console.error('Error: ' + err));
