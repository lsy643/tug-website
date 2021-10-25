require('dotenv').config();

const chalk = require('chalk');
const initStrapiClient = require('@tidb-community/datasource/lib/api/initStrapiClient').default;

const { env } = process;
const { log } = console;

const SYNC_APIS = [
  'tidbio-activitiespage-activities',
  'tidbio-homepage-banner-promotions',
  'tidbio-asktug-blogs',
  'tidbio-asktug-qa-topics',
  'tidbio-blibli-recent-videos',
  'tidbio-github-info',
];

(async () => {
  const localClient = await initStrapiClient({
    baseUrl: env.LOCAL_BASE_URL,
    email: env.LOCAL_EMAIL,
    password: env.LOCAL_PASSWORD,
  });

  const sourceClient = await initStrapiClient({
    baseUrl: env.SOURCE_BASE_URL,
    email: env.SOURCE_EMAIL,
    password: env.SOURCE_PASSWORD,
  });

  SYNC_APIS.map(async (api) => {
    let r;
    try {
      r = await sourceClient.get(api);
    } catch (err) {
      log(`${chalk.blueBright(`${api}`)} get source data err: ${chalk.redBright(`${JSON.stringify(err, null, 2)}`)}`);
    }

    try {
      await localClient.put(api, {
        data: r.data,
      });
    } catch (err) {
      log(`${chalk.blueBright(`${api}`)} set local data err: ${chalk.redBright(`${JSON.stringify(err, null, 2)}`)}`);
    }

    log(`${chalk.blueBright(`${api}`)} ${chalk.green('has been synced successfully!')}`);
  });
})();
