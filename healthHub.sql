\echo 'Delete and recreate healthHyb db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE healthHub;
CREATE DATABASE healthHub;
\connect healthHub

\i healthHubSchema.sql
\i healthHubSeed.sql

\echo 'Delete and recreate healthHubTest db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE healthHubTest;
CREATE DATABASE healthHubTest;
\connect healthHubTest

\i healthHubSchema.sql
