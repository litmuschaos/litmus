import prompts from 'prompts';
import { $ } from 'zx';

(async () => {
  const services = ['auth'];

  services.sort();

  const response = await prompts({
    type: 'multiselect',
    name: 'services',
    message: 'Please select the services you want to generate',
    choices: services.map(title => ({ title }))
  });

  if (!response.services || response.services.length === 0) {
    console.log('No services selected. Exiting...');
    process.exit(0);
  }

  for (const index of response.services) {
    const service = services[index];
    await $`npx oats import --config config/oats.config.ts --service ${service} --clean`;
  }

  await $`npx prettier --write \"src/services/**/*.{ts,tsx,json,scss}\"`;
})();
