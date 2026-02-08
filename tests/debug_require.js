// DEBUG MOCK LOADER
const Module = require('module');
const originalRequire = Module.prototype.require;

console.log("--- DEBUG: Starting Require Override ---");

Module.prototype.require = function (requestPath) {
    console.log(`[REQUIRE] ${requestPath}`);
    return originalRequire.apply(this, arguments);
};

try {
    require("../src/services/payment/createAdditionalPaymentService");
} catch (e) {
    console.log("Error loading service:", e.message);
}
