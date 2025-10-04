const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const setupTestDB = () => {
  // Créer une copie du schéma pour SQLite
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  const testSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.test.prisma');

  let schemaContent = fs.readFileSync(schemaPath, 'utf8');
  schemaContent = schemaContent.replace(
    'provider = "mysql"',
    'provider = "sqlite"'
  );

  fs.writeFileSync(testSchemaPath, schemaContent);

  // Générer le client Prisma pour les tests
  process.env.DATABASE_URL = 'file:./test.db';
  execSync('npx prisma generate --schema=./prisma/schema.test.prisma', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  // Appliquer les migrations
  execSync('npx prisma db push --schema=./prisma/schema.test.prisma', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
};

const cleanupTestDB = () => {
  // Supprimer la DB de test et le schéma de test
  const testDBPath = path.join(__dirname, '..', 'test.db');
  const testSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.test.prisma');

  if (fs.existsSync(testDBPath)) {
    fs.unlinkSync(testDBPath);
  }
  if (fs.existsSync(testSchemaPath)) {
    fs.unlinkSync(testSchemaPath);
  }
};

module.exports = { setupTestDB, cleanupTestDB };