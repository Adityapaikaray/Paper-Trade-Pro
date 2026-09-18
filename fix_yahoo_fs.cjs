const fs = require('fs');
let code = fs.readFileSync('src/server/yahooProvider.ts', 'utf8');

code = code.replace(/undefined\.writeFileSync\('\/tmp\/yf_log', "yahooFinance keys: " \+ Object\.keys\(yahooFinance \|\| \{\}\) \+ "\\nQueries: " \+ queries\.join\(","\)\);/g, "");
code = code.replace(/undefined\.appendFileSync\('\/tmp\/yf_log', "\\nERROR: " \+ e\.message\);/g, "");

fs.writeFileSync('src/server/yahooProvider.ts', code);
