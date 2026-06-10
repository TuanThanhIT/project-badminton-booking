# Static Seed Report

| Table in DatabaseFinal.sql | SQL rows | Seeder rows | Difference | Reason |
|---|---:|---:|---:|---|
| aichatmessages | 46 | 0 | -46 | Skipped: generated/business history; covered by 3-month demo seeders |
| aichatsessions | 16 | 0 | -16 | Skipped: generated/business history; covered by 3-month demo seeders |
| beverages | 13 | 13 | 0 | Seeded as static data |
| beveragestocks | 65 | 65 | 0 | Seeded as static data |
| branchemployees | 20 | 20 | 0 | Seeded as static data |
| branches | 5 | 5 | 0 | Seeded as static data |
| branchimages | 25 | 25 | 0 | Seeded as static data |
| branchmanagers | 5 | 5 | 0 | Seeded as static data |
| carts | 7 | 0 | -7 | Skipped: generated/business history; covered by 3-month demo seeders |
| categories | 78 | 78 | 0 | Seeded as static data |
| classrooms | 3 | 0 | -3 | Skipped: generated/business history; covered by 3-month demo seeders |
| coachapplications | 3 | 0 | -3 | Skipped: generated/business history; covered by 3-month demo seeders |
| coachprofiles | 4 | 4 | 0 | Seeded as static data |
| conversationparticipants | 6 | 0 | -6 | Skipped: generated/business history; covered by 3-month demo seeders |
| conversations | 3 | 0 | -3 | Skipped: generated/business history; covered by 3-month demo seeders |
| courtprices | 60 | 60 | 0 | Seeded as static data |
| courts | 75 | 75 | 0 | Seeded as static data |
| discounts | 10 | 10 | 0 | Seeded as static data |
| messages | 2 | 0 | -2 | Skipped: generated/business history; covered by 3-month demo seeders |
| notifications | 8 | 0 | -8 | Skipped: generated/business history; covered by 3-month demo seeders |
| postlikes | 2 | 0 | -2 | Skipped: generated/business history; covered by 3-month demo seeders |
| posts | 8 | 0 | -8 | Skipped: generated/business history; covered by 3-month demo seeders |
| productimages | 2308 | 2308 | 0 | Seeded as static data |
| products | 1170 | 1170 | 0 | Seeded as static data |
| productvariants | 3494 | 3494 | 0 | Seeded as static data |
| profiles | 68 | 68 | 0 | Seeded as static data |
| purchasereceiptdetails | 12 | 0 | -12 | Skipped: generated/business history; covered by 3-month demo seeders |
| purchasereceipts | 2 | 0 | -2 | Skipped: generated/business history; covered by 3-month demo seeders |
| refreshtokens | 86 | 0 | -86 | Skipped: unsafe/runtime metadata, token, OTP, or Sequelize migration metadata |
| roles | 5 | 5 | 0 | Seeded as static data |
| sequelizemeta | 66 | 0 | -66 | Skipped: unsafe/runtime metadata, token, OTP, or Sequelize migration metadata |
| stocktransactions | 12 | 0 | -12 | Skipped: generated/business history; covered by 3-month demo seeders |
| suppliers | 5 | 5 | 0 | Seeded as static data |
| userotps | 2 | 0 | -2 | Skipped: unsafe/runtime metadata, token, OTP, or Sequelize migration metadata |
| users | 68 | 68 | 0 | Seeded as static data |
| variantstocks | 17258 | 17258 | 0 | Seeded as static data |
| wallets | 40 | 40 | 0 | Seeded as static data |

Generated product rows are included in the static seed data when a category from SQL had fewer than 15 products.
Demo passwords are fixed by role and hashed during seeding; hashes are not stored in this report.
