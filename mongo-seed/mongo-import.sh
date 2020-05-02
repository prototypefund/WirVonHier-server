#!/bin/bash

mongoimport --host mongo --db wirvonhier --collection businesses --type json --file /businesses.json -u wirvonhier -p wirvonhierpass  --authenticationDatabase admin
mongoimport --host mongo --db wirvonhier --collection dataprotstatements --type json --file /dataprotstatements.json -u wirvonhier -p wirvonhierpass --authenticationDatabase admin
mongoimport --host mongo --db wirvonhier --collection images --type json --file /images.json -u wirvonhier -p wirvonhierpass --authenticationDatabase admin
mongoimport --host mongo --db wirvonhier --collection jobs_agenda --type json --file /jobs_agenda.json -u wirvonhier -p wirvonhierpass --authenticationDatabase admin
mongoimport --host mongo --db wirvonhier --collection locations --type json --file /locations.json -u wirvonhier -p wirvonhierpass --authenticationDatabase admin
mongoimport --host mongo --db wirvonhier --collection users --type json --file /users.json -u wirvonhier -p wirvonhierpass --authenticationDatabase admin
