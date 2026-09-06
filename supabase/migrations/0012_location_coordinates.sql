-- Batch 7: geolocation support for curated directory locations.
-- Keep location creation/admin curation separate; this migration only enriches
-- existing rows with approximate city-centre coordinates used to select the
-- nearest already-approved location.

update locations set latitude = 3.0738, longitude = 101.5183 where slug = 'shah-alam';
update locations set latitude = 3.0449, longitude = 101.4456 where slug = 'klang';
update locations set latitude = 3.0567, longitude = 101.5851 where slug = 'subang-jaya';
update locations set latitude = 3.1073, longitude = 101.6067 where slug = 'petaling-jaya';
update locations set latitude = 3.0327, longitude = 101.6188 where slug = 'puchong';
update locations set latitude = 3.1390, longitude = 101.6869 where slug = 'kuala-lumpur';

-- State centroids are useful as a graceful fallback if state-level locations
-- are exposed later, but city rows remain more precise and will win distance.
update locations set latitude = 3.0738, longitude = 101.5183 where slug = 'selangor';
