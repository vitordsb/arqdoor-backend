/**
 * Script to normalize signature_password_set for existing users.
 * Execute with: node scripts/patchSignaturePasswordDefaults.js
 */
const sequelize = require("../src/database/config");

async function patchSignatureDefaults() {
  try {
    const [updateResult] = await sequelize.query(
      "UPDATE `User` SET `signature_password_set` = 1 WHERE `signature_password_set` IS NULL AND `password` IS NOT NULL AND `password` <> ''"
    );
    const [clearResult] = await sequelize.query(
      "UPDATE `User` SET `signature_password_set` = 0 WHERE `signature_password_set` IS NULL AND (`password` IS NULL OR `password` = '')"
    );

    const updated = updateResult?.affectedRows ?? updateResult?.changedRows ?? 0;
    const cleared = clearResult?.affectedRows ?? clearResult?.changedRows ?? 0;

    console.log(
      `signature_password_set atualizado: ${updated} definidos como true, ${cleared} definidos como false.`
    );
    process.exit(0);
  } catch (err) {
    console.error(
      "Erro ao atualizar signature_password_set:",
      err?.message || err
    );
    process.exit(1);
  }
}

patchSignatureDefaults();
