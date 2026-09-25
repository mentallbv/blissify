import * as migration_20260630_140133 from './20260630_140133';
import * as migration_20260703_120000 from './20260703_120000';
import * as migration_20260727_143415 from './20260727_143415';
import * as migration_20260727_152413 from './20260727_152413';
import * as migration_20260728_101356 from './20260728_101356';
import * as migration_20260728_103238 from './20260728_103238';
import * as migration_20260728_115850_remove_provider_verification from './20260728_115850_remove_provider_verification';
import * as migration_20260728_123112 from './20260728_123112';
import * as migration_20260728_124953 from './20260728_124953';
import * as migration_20260812_091846 from './20260812_091846';
import * as migration_20260814_brand_accent_color from './20260814_brand_accent_color';
import * as migration_20260824_124554_blissify_2 from './20260824_124554_blissify_2';
import * as migration_20260826_partner_ultimate_course_features from './20260826_partner_ultimate_course_features';
import * as migration_20260924_trainer_social_tiktok from './20260924_trainer_social_tiktok';
import * as migration_20260925_pricing_remove_branding from './20260925_pricing_remove_branding';
import * as migration_20260925_taxonomy_to_client_list from './20260925_taxonomy_to_client_list';
import * as migration_20260925_trainer_location_country from './20260925_trainer_location_country';

export const migrations = [
  {
    up: migration_20260630_140133.up,
    down: migration_20260630_140133.down,
    name: '20260630_140133',
  },
  {
    up: migration_20260703_120000.up,
    down: migration_20260703_120000.down,
    name: '20260703_120000',
  },
  {
    up: migration_20260727_143415.up,
    down: migration_20260727_143415.down,
    name: '20260727_143415',
  },
  {
    up: migration_20260727_152413.up,
    down: migration_20260727_152413.down,
    name: '20260727_152413',
  },
  {
    up: migration_20260728_101356.up,
    down: migration_20260728_101356.down,
    name: '20260728_101356',
  },
  {
    up: migration_20260728_103238.up,
    down: migration_20260728_103238.down,
    name: '20260728_103238',
  },
  {
    up: migration_20260728_115850_remove_provider_verification.up,
    down: migration_20260728_115850_remove_provider_verification.down,
    name: '20260728_115850_remove_provider_verification',
  },
  {
    up: migration_20260728_123112.up,
    down: migration_20260728_123112.down,
    name: '20260728_123112',
  },
  {
    up: migration_20260728_124953.up,
    down: migration_20260728_124953.down,
    name: '20260728_124953',
  },
  {
    up: migration_20260812_091846.up,
    down: migration_20260812_091846.down,
    name: '20260812_091846',
  },
  {
    up: migration_20260814_brand_accent_color.up,
    down: migration_20260814_brand_accent_color.down,
    name: '20260814_brand_accent_color',
  },
  {
    up: migration_20260824_124554_blissify_2.up,
    down: migration_20260824_124554_blissify_2.down,
    name: '20260824_124554_blissify_2'
  },
  {
    up: migration_20260826_partner_ultimate_course_features.up,
    down: migration_20260826_partner_ultimate_course_features.down,
    name: '20260826_partner_ultimate_course_features',
  },
  {
    up: migration_20260924_trainer_social_tiktok.up,
    down: migration_20260924_trainer_social_tiktok.down,
    name: '20260924_trainer_social_tiktok',
  },
  {
    up: migration_20260925_pricing_remove_branding.up,
    down: migration_20260925_pricing_remove_branding.down,
    name: '20260925_pricing_remove_branding',
  },
  {
    up: migration_20260925_taxonomy_to_client_list.up,
    down: migration_20260925_taxonomy_to_client_list.down,
    name: '20260925_taxonomy_to_client_list',
  },
  {
    up: migration_20260925_trainer_location_country.up,
    down: migration_20260925_trainer_location_country.down,
    name: '20260925_trainer_location_country',
  },
];
