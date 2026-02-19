import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding RentFlow Pro demo data...");

  // Create demo tenant
  const tenant = await db.tenant.create({
    data: {
      name: "Acme Rent-to-Own",
      slug: "acme-rto",
      phone: "(555) 100-2000",
      address: "100 Main Street",
      city: "Springfield",
      state: "IL",
      zip: "62701",
      defaultTaxRate: 8.75,
      subscriptionPlan: "professional",
    },
  });

  console.log("✅ Tenant created:", tenant.name);

  // Create demo customers
  const customers = await Promise.all([
    db.customer.create({
      data: {
        tenantId: tenant.id, name: "Marcus Johnson", phone: "(555) 234-5678",
        email: "marcus.j@email.com", address: "142 Oak St", city: "Springfield",
        county: "Sangamon", state: "IL", zip: "62701", status: "active",
        autopayEnabled: true, paymentDisplay: "ACH •6612", taxRate: 8.75,
        riskScore: 92, rating: "A", balance: 0,
      },
    }),
    db.customer.create({
      data: {
        tenantId: tenant.id, name: "Sarah Williams", phone: "(555) 345-6789",
        email: "sarah.w@email.com", address: "88 Elm Ave", city: "Decatur",
        county: "Macon", state: "IL", zip: "62521", status: "delinquent",
        autopayEnabled: false, taxRate: 9.25, riskScore: 41, rating: "D",
        balance: 232.47, daysLate: 14,
      },
    }),
    db.customer.create({
      data: {
        tenantId: tenant.id, name: "David Chen", phone: "(555) 678-9012",
        email: "david.c@email.com", address: "720 Cedar Blvd", city: "Springfield",
        county: "Sangamon", state: "IL", zip: "62703", status: "active",
        autopayEnabled: true, paymentDisplay: "ACH •3301", taxRate: 8.75,
        riskScore: 95, rating: "A+", balance: 0,
      },
    }),
    db.customer.create({
      data: {
        tenantId: tenant.id, name: "Tanya Brooks", phone: "(555) 567-8901",
        email: "tanya.b@email.com", address: "55 Maple Ln", city: "Champaign",
        county: "Champaign", state: "IL", zip: "61820", status: "collections",
        autopayEnabled: false, taxRate: 9.0, riskScore: 12, rating: "F",
        balance: 503.91, daysLate: 67, hvacMode: "Safe Mode",
      },
    }),
    db.customer.create({
      data: {
        tenantId: tenant.id, name: "Robert Martinez", phone: "(555) 789-0123",
        email: "robert.m@email.com", address: "199 Birch Ct", city: "Bloomington",
        county: "McLean", state: "IL", zip: "61701", status: "delinquent",
        autopayEnabled: false, paymentDisplay: "Visa •7788", taxRate: 8.50,
        riskScore: 35, rating: "D", balance: 289.50, daysLate: 34,
        hvacMode: "Safe Mode",
      },
    }),
  ]);

  console.log(`✅ ${customers.length} customers created`);

  // Create demo inventory
  const inv = await Promise.all([
    db.inventory.create({
      data: {
        tenantId: tenant.id, name: 'Samsung 65" 4K TV', category: "electronics",
        serialNumber: "SN-TV-88421", cost: 450, cashPrice: 899, rbv: 287,
        depreciation: 163, depMethod: "macrs", status: "on_contract",
      },
    }),
    db.inventory.create({
      data: {
        tenantId: tenant.id, name: "Whirlpool Washer/Dryer", category: "appliances",
        serialNumber: "SN-WD-77563", cost: 800, cashPrice: 1599, rbv: 444,
        depreciation: 356, depMethod: "income_forecast", status: "on_contract",
      },
    }),
    db.inventory.create({
      data: {
        tenantId: tenant.id, name: "Carrier 3-Ton AC Unit", category: "hvac",
        serialNumber: "SN-AC-55100", cost: 2200, cashPrice: 4399, rbv: 1833,
        depreciation: 367, depMethod: "macrs", status: "on_contract", iotEnabled: true,
      },
    }),
    db.inventory.create({
      data: {
        tenantId: tenant.id, name: "Trane XR15 Heat Pump", category: "hvac",
        serialNumber: "SN-HP-55201", cost: 3100, cashPrice: 6199, rbv: 2583,
        depreciation: 517, depMethod: "macrs", status: "on_contract", iotEnabled: true,
      },
    }),
    db.inventory.create({
      data: {
        tenantId: tenant.id, name: "Goodman 2.5-Ton AC", category: "hvac",
        serialNumber: "SN-AC-55300", cost: 1800, cashPrice: 3599, rbv: 900,
        depreciation: 900, depMethod: "macrs", status: "on_contract", iotEnabled: true,
      },
    }),
    db.inventory.create({
      data: {
        tenantId: tenant.id, name: "GE French Door Fridge", category: "appliances",
        serialNumber: "SN-RF-66234", cost: 900, cashPrice: 1799, rbv: 825,
        depreciation: 75, depMethod: "straight_line", status: "available",
      },
    }),
    db.inventory.create({
      data: {
        tenantId: tenant.id, name: "Ashley Sectional Sofa", category: "furniture",
        serialNumber: "SN-SF-33102", cost: 650, cashPrice: 1299, rbv: 520,
        depreciation: 130, depMethod: "straight_line", status: "available",
      },
    }),
  ]);

  console.log(`✅ ${inv.length} inventory items created`);

  // Create IoT devices for HVAC items
  const iotItems = inv.filter((i) => i.iotEnabled);
  for (const item of iotItems) {
    const mode = item.name.includes("Carrier") ? "active" : "safe_mode";
    await db.iotDevice.create({
      data: {
        tenantId: tenant.id,
        inventoryId: item.id,
        deviceSerial: `RF-IOT-${item.serialNumber?.slice(-5)}`,
        connectionType: "LTE Cat-M1",
        signalStrength: -70 - Math.floor(Math.random() * 20),
        firmwareVersion: "v2.4.1",
        mode,
        currentTemp: mode === "active" ? 72 : 82 + Math.floor(Math.random() * 4),
        setTemp: mode === "active" ? 72 : 85,
        safeModeCoolMax: 85,
        safeModeHeatMax: 55,
      },
    });
  }
  console.log(`✅ ${iotItems.length} IoT devices created`);

  // Create contracts
  const contracts = await Promise.all([
    db.contract.create({
      data: {
        tenantId: tenant.id, customerId: customers[0].id, inventoryId: inv[0].id,
        type: "rto", monthlyAmount: 53, termMonths: 24, paymentsMade: 5,
        dueDate: new Date("2025-02-28"), status: "active", taxAmount: 4.64, epoAmount: 969,
      },
    }),
    db.contract.create({
      data: {
        tenantId: tenant.id, customerId: customers[2].id, inventoryId: inv[2].id,
        type: "rto", monthlyAmount: 245, termMonths: 24, paymentsMade: 6,
        dueDate: new Date("2025-02-28"), status: "active", taxAmount: 21.44, epoAmount: 3420,
      },
    }),
    db.contract.create({
      data: {
        tenantId: tenant.id, customerId: customers[3].id, inventoryId: inv[4].id,
        type: "rto", monthlyAmount: 199, termMonths: 24, paymentsMade: 3,
        dueDate: new Date("2024-12-15"), status: "collections", taxAmount: 17.91,
        epoAmount: 2890, lateFee: 75, daysLate: 67,
      },
    }),
    db.contract.create({
      data: {
        tenantId: tenant.id, customerId: customers[4].id, inventoryId: inv[3].id,
        type: "rto", monthlyAmount: 339, termMonths: 24, paymentsMade: 4,
        dueDate: new Date("2025-01-12"), status: "late", taxAmount: 28.82,
        epoAmount: 5100, lateFee: 25, daysLate: 34,
      },
    }),
    db.contract.create({
      data: {
        tenantId: tenant.id, customerId: customers[1].id, inventoryId: inv[1].id,
        type: "rto", monthlyAmount: 90, termMonths: 24, paymentsMade: 6,
        dueDate: new Date("2025-01-31"), status: "late", taxAmount: 8.33,
        epoAmount: 1620, lateFee: 10, daysLate: 14,
      },
    }),
  ]);
  console.log(`✅ ${contracts.length} contracts created`);

  // Create some payment history
  for (let i = 0; i < 4; i++) {
    await db.payment.create({
      data: {
        tenantId: tenant.id,
        customerId: customers[0].id,
        contractId: contracts[0].id,
        amount: 57.64,
        method: "ach",
        type: "autopay",
      },
    });
  }
  console.log("✅ Payment history created");

  // Create activity log
  await db.activityLog.create({
    data: {
      tenantId: tenant.id,
      action: "🚀 RentFlow Pro initialized with demo data",
      type: "system",
    },
  });
  await db.activityLog.create({
    data: {
      tenantId: tenant.id,
      action: "📡 3 IoT HVAC relays registered (LTE Cat-M1)",
      type: "iot",
    },
  });

  console.log("\n🎉 Seed complete! Demo data loaded.");
  console.log("   Run 'npm run dev' and sign up to see your data.");
  console.log("   Note: After signing up, you'll need to manually link your");
  console.log("   Clerk user to the demo tenant in the database.");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
