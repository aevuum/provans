#!/usr/bin/env node
/* eslint-disable */
const { execSync, spawnSync, spawn } = require('child_process');

function run(cmd, opts = {}){
  console.log('> ' + cmd);
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

function commandExists(cmd){
  try { execSync(`which ${cmd}`, { stdio: 'ignore' }); return true } catch { return false }
}

async function main(){
  try{
    // If DATABASE_URL is already set — use it (assume user configured DB).
    if(!process.env.DATABASE_URL){
      // If docker CLI missing -> cannot proceed (try open Docker Desktop on macOS)
      if(!commandExists('docker')){
        console.error('Docker CLI not found in PATH. Please install Docker or set DATABASE_URL in environment.');
        process.exit(1);
      }

      // If docker exists but daemon not running, on macOS try to open Docker Desktop and wait
      try {
        execSync('docker info', { stdio: 'ignore' });
      } catch {
        if (process.platform === 'darwin' && commandExists('open')) {
          console.log('Docker daemon not running — attempting to open Docker Desktop (macOS).');
          try{ run('open -a Docker'); } catch { /* ignore */ }

          // wait for docker daemon to come up (max 60s)
          console.log('Waiting up to 60s for Docker daemon...');
          let waited = 0;
          const maxWait = 60;
          while (waited < maxWait) {
            try { execSync('docker info', { stdio: 'ignore' }); break; } catch { /* still starting */ }
            spawnSync('sleep', ['2']);
            waited += 2;
            process.stdout.write('.');
          }
          console.log('');
          try { execSync('docker info', { stdio: 'ignore' }); }
          catch {
            console.error('Docker daemon did not start within 60s. Please ensure Docker Desktop is installed and running, then retry.');
            process.exit(1);
          }
        } else {
          console.error('Docker daemon is not available. Please start Docker or set DATABASE_URL in environment.');
          process.exit(1);
        }
      }

      // Check if container exists and is running
      let running = false;
      try{
        const out = execSync('docker ps --filter name=provance-postgres --format "{{.Names}}:{{.Status}}"').toString().trim();
        running = out.split('\n').some(l => l.startsWith('provance-postgres'));
      }catch { running = false }

      if(!running){
        console.log('Starting local Postgres container (provance-postgres)...');
        try{
          run('docker run -d --name provance-postgres -e POSTGRES_USER=dev -e POSTGRES_PASSWORD=pass -e POSTGRES_DB=provance -p 5432:5432 postgres:15');
        }catch(e){
          console.error('Failed to start postgres container:', e && e.message);
          process.exit(1);
        }
        // wait a bit for DB to boot
        console.log('Waiting 4s for Postgres to initialize...');
        spawnSync('sleep', ['4']);
      } else {
        console.log('Found running provance-postgres container.');
      }

      // set fallback DATABASE_URL for local docker
      process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://dev:pass@localhost:5432/provance?schema=public';
      console.log('Using DATABASE_URL=', process.env.DATABASE_URL);
    } else {
      console.log('DATABASE_URL is already set, will use it.');
    }

  const schemaPath = 'src/prisma/schema.prisma';

    // Generate client
    console.log('\n=== prisma generate ===');
    run(`npx prisma generate --schema=${schemaPath}`);

    // Try migrate deploy, fallback to db push if fails
    console.log('\n=== prisma migrate deploy (fallback to db push) ===');
    try{
      run(`npx prisma migrate deploy --schema=${schemaPath}`);
    }catch{
      console.warn('migrate deploy failed or no migrations found, trying db push...');
      run(`npx prisma db push --schema=${schemaPath}`);
    }

    // Finally run Prisma Studio
    console.log('\n=== starting Prisma Studio ===');
    const studio = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['prisma','studio','--schema='+schemaPath], { stdio: 'inherit', env: process.env });
    studio.on('exit', code => {
      console.log('Prisma Studio exited with code', code);
      process.exit(code);
    });

  }catch(err){
    console.error('Error in start-studio-with-postgres:', err && (err.message || String(err)));
    process.exit(1);
  }
}

main();
